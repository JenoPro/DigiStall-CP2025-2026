import express from 'express'
import authMiddleware from '../middleware/auth.js'
import {
  // Unified authentication
  login,
  verifyToken as verifyTokenHandler,
  getCurrentUser,
  logout
} from '../controllers/auth/unifiedAuthController.js'

// Legacy authentication (for backward compatibility)
import {
  adminLogin,
  branchManagerLogin,
  createAdminUser,
  createPasswordHash,
  testDb
} from '../controllers/auth/loginController.js'

const router = express.Router()

// ===== UNIFIED AUTHENTICATION ENDPOINTS =====
// Single clean login endpoint for all user types
router.post('/login', login)                            // POST /api/auth/login - Unified login (admin, branch_manager, employee)
router.get('/verify-token', verifyTokenHandler)         // GET /api/auth/verify-token - Verify JWT token

// ===== LEGACY ENDPOINTS (Backward Compatibility) =====
router.post('/admin/login', adminLogin)                 // POST /api/auth/admin/login - Admin login (legacy)
router.post('/branch_manager/login', branchManagerLogin) // POST /api/auth/branch_manager/login - Branch manager login (legacy)

// ===== UTILITY ENDPOINTS =====
router.post('/create-admin', createAdminUser)           // POST /api/auth/create-admin - Create admin user
router.post('/hash-password', createPasswordHash)       // POST /api/auth/hash-password - Create password hash
router.get('/test-db', testDb)                         // GET /api/auth/test-db - Test database connection

// ===== PROTECTED ROUTES =====
router.use(authMiddleware.authenticateToken) // Apply auth middleware to routes below
router.post('/logout', logout)                         // POST /api/auth/logout - Logout
router.get('/me', getCurrentUser)                      // GET /api/auth/me - Get current user info
router.get('/branch-manager-info', getCurrentUser)    // GET /api/auth/branch-manager-info - Get branch manager info (alias for backward compatibility)
router.get('/admin-info', getCurrentUser)             // GET /api/auth/admin-info - Get admin info (alias for backward compatibility)

export default router