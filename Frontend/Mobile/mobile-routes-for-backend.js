import express from 'express'
import { mobileLogin, submitApplication } from '../controllers/login/loginController.js'

const router = express.Router()

// Mobile login route - POST /api/mobile/mobile-login
router.post('/mobile-login', mobileLogin)

// Mobile application submission route - POST /api/mobile/submit-application
router.post('/submit-application', submitApplication)

// Health check for mobile - GET /api/mobile/health
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Mobile API is working',
    timestamp: new Date().toISOString(),
    endpoints: {
      login: '/api/mobile/mobile-login',
      submitApplication: '/api/mobile/submit-application'
    }
  });
});

export default router