import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  template: {
    type: String,
    default: null,
  },
  personalInfo: {
    fullName: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    linkedin: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    summary: {
      type: String,
      default: "",
    },
  },
  education: [
    {
      institution: {
        type: String,
        default: "",
      },
      degree: {
        type: String,
        default: "",
      },
      field: {
        type: String,
        default: "",
      },
      startDate: {
        type: String,
        default: "",
      },
      endDate: {
        type: String,
        default: "",
      },
      gpa: {
        type: String,
        default: "",
      },
      description: {
        type: String,
        default: "",
      },
    },
  ],
  workExperience: [
    {
      company: {
        type: String,
        default: "",
      },
      position: {
        type: String,
        default: "",
      },
      startDate: {
        type: String,
        default: "",
      },
      endDate: {
        type: String,
        default: "",
      },
      current: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
        default: "",
      },
      achievements: [
        {
          type: String,
          default: "",
        },
      ],
    },
  ],
  skills: [
    {
      name: {
        type: String,
        default: "",
      },
      level: {
        type: Number,
        default: 3,
      },
    },
  ],
  projects: [
    {
      title: {
        type: String,
        default: "",
      },
      description: {
        type: String,
        default: "",
      },
      github: {
        type: String,
        default: "",
      },
      liveDemo: {
        type: String,
        default: "",
      },
    },
  ],
  certifications: [
    {
      title: {
        type: String,
        default: "",
      },
      issuer: {
        type: String,
        default: "",
      },
      year: {
        type: String,
        default: "",
      },
    },
  ],
  languages: [
    {
      name: {
        type: String,
        default: "",
      },
      level: {
        type: String,
        default: "",
      },
    },
  ],
  interests: [
    {
      type: String,
      default: "",
    },
  ],
  thumbnailLink: {
    type: String,
    default: null,
  },
  downloadCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;
