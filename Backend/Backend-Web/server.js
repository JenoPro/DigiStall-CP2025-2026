// ===== NAGA STALL UNIFIED BACKEND SERVER =====
// Combined backend for both Landing Page and Management functions

import express from 'express';
import cors from 'cors';
import { createConnection } from './config/database.js';
import { corsConfig } from './config/cors.js';
import authMiddleware from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import route files
import authRoutes from './routes/authRoutes.js';
import applicantRoutes from './routes/applicantRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import stallRoutes from './routes/stallRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARE =====
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors(corsConfig));

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

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
    await connection.execute('SELECT 1');
    await connection.end();
    
    res.status(200).json({
      success: true,
      message: 'Server and database are healthy',
      timestamp: new Date().toISOString(),
      services: {
        server: 'running',
        database: 'connected'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString(),
      services: {
        server: 'running',
        database: 'error'
      }
    });
  }
});

// ===== ROOT ENDPOINT =====
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Naga Stall Management System - Unified Backend API',
    version: '1.0.0',
    features: {
      landingPage: 'Stall browsing and applications',
      management: 'Admin, branch, and employee management',
      mobile: 'Mobile app support'
    },
    endpoints: {
      auth: '/api/auth',
      stalls: '/api/stalls',
      applications: '/api/applications',
      applicants: '/api/applicants',
      branches: '/api/branches',
      employees: '/api/employees',
      health: '/api/health'
    }
  });
});

// ===== ERROR HANDLING =====
app.use(errorHandler);

// Handle 404 errors
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    availableEndpoints: [
      '/api/auth',
      '/api/stalls',
      '/api/applications',
      '/api/applicants',
      '/api/branches',
      '/api/employees',
      '/api/health'
    ]
  });
});

// ===== SERVER STARTUP =====
app.listen(PORT, async () => {
  console.log(`
🚀 Naga Stall Management System - Unified Backend
📍 Server running on port ${PORT}
🌐 Environment: ${process.env.NODE_ENV || 'development'}
⏰ Started at: ${new Date().toISOString()}

📋 Available Services:
   🏪 Landing Page API  - Stall browsing and applications
   🔧 Management API    - Admin and employee functions
   📱 Mobile API        - Mobile app support

🔗 Health Check: http://localhost:${PORT}/api/health
📚 API Documentation: http://localhost:${PORT}/
  `);

  // Test database connection
  try {
    const connection = await createConnection();
    await connection.execute('SELECT 1');
    await connection.end();
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
});