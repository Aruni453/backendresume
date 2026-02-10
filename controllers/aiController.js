import { GoogleGenerativeAI } from "@google/generative-ai";

// CHAT WITH AI ASSISTANT
export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are ResumeBuilder AI, a helpful assistant for creating professional resumes. You help users with resume writing, career advice, and job search tips. Always be professional, encouraging, and provide actionable advice.

User message: ${message}

Respond as ResumeBuilder AI:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      success: true,
      message: text
    });

  } catch (err) {
    console.error("Gemini chat error:", err);
    res.status(500).json({ message: err.message || "AI chat failed" });
  }
};
