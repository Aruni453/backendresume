import Resume from "../models/resumeModel.js";
import User from "../models/userModel.js";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { GoogleGenerativeAI } from "@google/generative-ai";


// CREATE RESUME
export const createResume = async (req, res) => {
  try {
    const { title, template, personalInfo, education, workExperience, skills, projects, certifications, languages, interests } = req.body;

    const defaultResumeData = {
      template: template || null,
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        address: '',
        linkedin: '',
        website: '',
        summary: '',
        ...personalInfo
      },
      education: education || [],
      workExperience: workExperience || [],
      skills: skills || [],
      projects: projects || [],
      certifications: certifications || [],
      languages: languages || [],
      interests: interests || []
    };

    const newResume = await Resume.create({
      userId: req.user._id,
      title: title || 'My Resume',
      ...defaultResumeData
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { resumesCreated: 1 } });

    res.status(201).json(newResume);
  } catch (error) {
    res.status(500).json({ message: "failed to create resume", error: error.message });
  }
};

// GET USER RESUMES
export const getUserResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.status(200).json(resumes);
  } catch (error) {
    res.status(500).json({ message: "failed to get resume", error: error.message });
  }
};

// GET BY ID
export const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: "failed to get resume", error: error.message });
  }
};

// UPDATE
export const updateResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    Object.assign(resume, req.body);
    const savedResume = await resume.save();
    res.status(200).json(savedResume);
  } catch (error) {
    res.status(500).json({ message: "failed to update resume", error: error.message });
  }
};

// DELETE
export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    const uploadsFolder = path.join(process.cwd(), 'uploads');

    if (resume.thumbnailLink) {
      const oldPath = path.join(uploadsFolder, path.basename(resume.thumbnailLink));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    await User.findByIdAndUpdate(req.user._id, { $inc: { resumesCreated: -1 } });

    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "failed to delete resume", error: error.message });
  }
};

// DOWNLOAD PDF
export const downloadResumePDF = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    const doc = new PDFDocument();
    const filename = `${resume.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // Title
    doc.fontSize(24).text(resume.title, { align: 'center' });
    doc.moveDown();

    // Personal Info
    if (resume.personalInfo) {
      doc.fontSize(16).text('Personal Information', { underline: true });
      doc.fontSize(12);
      if (resume.personalInfo.fullName) doc.text(`Name: ${resume.personalInfo.fullName}`);
      if (resume.personalInfo.email) doc.text(`Email: ${resume.personalInfo.email}`);
      if (resume.personalInfo.phone) doc.text(`Phone: ${resume.personalInfo.phone}`);
      if (resume.personalInfo.address) doc.text(`Address: ${resume.personalInfo.address}`);
      if (resume.personalInfo.linkedin) doc.text(`LinkedIn: ${resume.personalInfo.linkedin}`);
      if (resume.personalInfo.website) doc.text(`Website: ${resume.personalInfo.website}`);
      if (resume.personalInfo.summary) {
        doc.moveDown();
        doc.text('Summary:', { underline: true });
        doc.text(resume.personalInfo.summary);
      }
      doc.moveDown();
    }

    // Education
    if (resume.education && resume.education.length > 0) {
      doc.fontSize(16).text('Education', { underline: true });
      resume.education.forEach(edu => {
        doc.fontSize(12);
        doc.text(`${edu.degree} in ${edu.field} - ${edu.institution}`);
        doc.text(`${edu.startDate} - ${edu.endDate}`);
        if (edu.gpa) doc.text(`GPA: ${edu.gpa}`);
        if (edu.description) doc.text(edu.description);
        doc.moveDown();
      });
    }

    // Work Experience
    if (resume.workExperience && resume.workExperience.length > 0) {
      doc.fontSize(16).text('Work Experience', { underline: true });
      resume.workExperience.forEach(exp => {
        doc.fontSize(12);
        doc.text(`${exp.position} at ${exp.company}`);
        doc.text(`${exp.startDate} - ${exp.endDate}`);
        if (exp.description) doc.text(exp.description);
        doc.moveDown();
      });
    }

    // Skills
    if (resume.skills && resume.skills.length > 0) {
      doc.fontSize(16).text('Skills', { underline: true });
      doc.fontSize(12).text(resume.skills.map(skill => skill.name).join(', '));
      doc.moveDown();
    }

    // Projects
    if (resume.projects && resume.projects.length > 0) {
      doc.fontSize(16).text('Projects', { underline: true });
      resume.projects.forEach(proj => {
        doc.fontSize(12);
        doc.text(proj.title);
        if (proj.description) doc.text(proj.description);
        if (proj.github) doc.text(`GitHub: ${proj.github}`);
        if (proj.liveDemo) doc.text(`Live Demo: ${proj.liveDemo}`);
        doc.moveDown();
      });
    }

    // Certifications
    if (resume.certifications && resume.certifications.length > 0) {
      doc.fontSize(16).text('Certifications', { underline: true });
      resume.certifications.forEach(cert => {
        doc.fontSize(12);
        doc.text(`${cert.title} - ${cert.issuer} (${cert.year})`);
      });
      doc.moveDown();
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ message: "Failed to download PDF", error: error.message });
  }
};

// GEMINI AI CONTENT
export const generateContent = async (req, res) => {
  try {
    const { type, data } = req.body;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let prompt = "";

    switch (type) {
      case "summary":
        prompt = `Generate a professional resume summary for ${data.name || 'a person'} with the following background:

Experience: ${Array.isArray(data.experience) ? data.experience.map(exp => `${exp.position} at ${exp.company}`).join(', ') : 'None provided'}
Education: ${Array.isArray(data.education) ? data.education.map(edu => `${edu.degree} in ${edu.field} from ${edu.institution}`).join(', ') : 'None provided'}
Skills: ${Array.isArray(data.skills) ? data.skills.map(skill => skill.name).join(', ') : 'None provided'}

Please write a concise, professional summary paragraph.`;
        break;

      case "skills":
        prompt = `Suggest 8-10 relevant professional skills for someone with this background:

Experience: ${Array.isArray(data.experience) ? data.experience.map(exp => `${exp.position} at ${exp.company}`).join(', ') : 'None provided'}
Education: ${Array.isArray(data.education) ? data.education.map(edu => `${edu.degree} in ${edu.field} from ${edu.institution}`).join(', ') : 'None provided'}

Please list the skills as a comma-separated list.`;
        break;

      case "job-description":
        prompt = `Improve and enhance this job description to make it more professional and detailed:

${data.description || 'No description provided'}

Please provide an improved version with better language and more specific details.`;
        break;

      default:
        return res.status(400).json({ message: "Invalid type" });
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      success: true,
      type,
      content: text
    });

  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ message: err.message || "AI failed" });
  }
};
