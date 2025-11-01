import express from "express";
import { applicationController } from "../controllers/applications.js";

const router = express.Router();

// Application routes
router.post("/", applicationController.createApplication); // POST /api/applications - Create new application
router.get("/", applicationController.getAllApplications); // GET /api/applications - Get all applications (with filters)
router.get("/statistics", applicationController.getApplicationsByStatus); // GET /api/applications/statistics - Get application statistics

// Applicant routes (for fetching applicants from database) - Place before parameterized routes
router.get("/applicants", applicationController.getAllApplicants); // GET /api/applications/applicants - Get all applicants
router.get("/applicants/:applicant_id", applicationController.getApplicantById); // GET /api/applications/applicants/:applicant_id - Get applicant by ID

router.get("/:id", applicationController.getApplicationById); // GET /api/applications/:id - Get application by ID
router.put("/:id/status", applicationController.updateApplicationStatus); // PUT /api/applications/:id/status - Update application status
router.delete("/:id", applicationController.deleteApplication); // DELETE /api/applications/:id - Delete application

export default router;