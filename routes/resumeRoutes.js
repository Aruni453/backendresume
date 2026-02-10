import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createResume, getResumeById, getUserResumes, updateResume, deleteResume, downloadResumePDF, generateContent } from '../controllers/resumeController.js';
import { uploadResumeImages } from '../controllers/uploadImages.js';



const resumeRouter=express.Router();
resumeRouter.post('/',protect,createResume)
resumeRouter.get('/',protect,getUserResumes)
resumeRouter.get('/:id',protect,getResumeById)
resumeRouter.get('/:id/download',protect,downloadResumePDF)

resumeRouter.post('/generate',protect,generateContent)
resumeRouter.put('/:id',protect,updateResume)
resumeRouter.put('/:id/images',protect,uploadResumeImages)
resumeRouter.post('/:id/upload',protect,uploadResumeImages)
resumeRouter.delete('/:id',protect,deleteResume)

export default resumeRouter;
