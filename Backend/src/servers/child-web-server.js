import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from the main Backend folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '../../');
dotenv.config({ path: path.join(backendRoot, '.env') });

// Import configurations and middleware from Backend-Web
import { createConnection } from '../../Backend-Web/config/database.js';
import { corsConfig } from '../../Backend-Web/config/cors.js';
import authMiddleware from '../../Backend-Web/middleware/auth.js';
import { errorHandler } from '../../Backend-Web/middleware/errorHandler.js';

// Import route files from Backend-Web
import authRoutes from '../../Backend-Web/routes/authRoutes.js';
import applicantRoutes from '../../Backend-Web/routes/applicantRoutes.js';
import applicationRoutes from '../../Backend-Web/routes/applicationRoutes.js';
import stallRoutes from '../../Backend-Web/routes/stallRoutes.js';
import branchRoutes from '../../Backend-Web/routes/branchRoutes.js';
import employeeRoutes from '../../Backend-Web/routes/employeeRoutes.js';

const app = express();
const PORT = process.env.WEB_PORT || 5000;

// ===== MIDDLEWARE =====
app.use(cors(corsConfig));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ===== ROUTES =====

// Public routes (no authentication required)
app.use('/api/auth', authRoutes);
app.use('/api/stalls', stallRoutes);           // Stalls routes (public for landing page + protected for admin)
app.use('/api/applications', applicationRoutes); // Applications (public for submissions)
app.use('/api/employees', employeeRoutes);     // Employee routes (login is public, others protected internally)

// Management routes (authentication required)
app.use('/api/applicants', authMiddleware.authenticateToken, applicantRoutes);
app.use('/api/branches', authMiddleware.authenticateToken, branchRoutes);

// ===== HEALTH CHECK =====
app.get('/api/health', async (req, res) => {
  try {
    const connection = await createConnection();
    await connection.end();
    
    res.status(200).json({
      success: true,
      message: 'Server is running and database connection is healthy',
      timestamp: new Date().toISOString(),
      port: PORT
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ===== ROOT ROUTE =====
app.get('/', (req, res) => {
  res.json({
    message: 'Naga Stall Management System - Web Server',
    version: '2.0.0',
    status: 'active',
    services: {
      'Landing Page API': 'Stall browsing and applications',
      'Management API': 'Admin and employee functions'
    },
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      stalls: '/api/stalls/*',
      applications: '/api/applications/*',
      employees: '/api/employees/*',
      applicants: '/api/applicants/*',
      branches: '/api/branches/*'
    }
  });
});

// ===== ERROR HANDLING =====
app.use(errorHandler);

// ===== SERVER STARTUP =====
app.listen(PORT, () => {
  console.log(`
🚀 Naga Stall Management System - Web Server
📍 Server running on port ${PORT}
🌐 Environment: ${process.env.NODE_ENV || 'development'}
⏰ Started at: ${new Date().toISOString()}

📋 Available Services:
   🏪 Landing Page API  - Stall browsing and applications
   🔧 Management API    - Admin and employee functions

🔗 Health Check: http://localhost:${PORT}/api/health
📚 API Documentation: http://localhost:${PORT}/
  `);
});

export default app;