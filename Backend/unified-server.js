import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import all route modules
import webAuthRoutes from './Backend-Web/routes/authRoutes.js';
import webApplicationRoutes from './Backend-Web/routes/applicationRoutes.js';
import webApplicantRoutes from './Backend-Web/routes/applicantRoutes.js';
import webStallRoutes from './Backend-Web/routes/stallRoutes.js';
import webEmployeeRoutes from './Backend-Web/routes/employeeRoutes.js';
import webBranchRoutes from './Backend-Web/routes/branchRoutes.js';

import mobileAuthRoutes from './Backend-Mobile/routes/authRoutes.js';
import mobileApplicationRoutes from './Backend-Mobile/routes/applicationRoutes.js';
import mobileLoginRoutes from './Backend-Mobile/routes/loginRouter.js';
import mobileStallRoutes from './Backend-Mobile/routes/stallRoutes.js';
import mobileUserRoutes from './Backend-Mobile/routes/userRoutes.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import authMiddleware from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:5173',  // Vite dev server
        'http://localhost:3000',  // Frontend dev server
        'http://localhost:8080',  // Mobile app
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:8080'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Unified Naga Stall Backend Server Running',
        timestamp: new Date().toISOString(),
        services: {
            web: 'Landing Page & Admin Panel',
            mobile: 'Mobile Application'
        }
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Naga Stall Management System - Unified Backend',
        version: '2.0.0',
        endpoints: {
            web: {
                auth: '/api/web/auth',
                applications: '/api/web/applications',
                applicants: '/api/web/applicants',
                stalls: '/api/web/stalls',
                employees: '/api/web/employees',
                branches: '/api/web/branches'
            },
            mobile: {
                auth: '/api/mobile/auth',
                applications: '/api/mobile/applications',
                login: '/api/mobile/login',
                stalls: '/api/mobile/stalls',
                users: '/api/mobile/users'
            }
        }
    });
});

// WEB ROUTES (Landing Page & Admin Panel)
app.use('/api/web/auth', webAuthRoutes);
app.use('/api/web/applications', webApplicationRoutes);
app.use('/api/web/applicants', webApplicantRoutes);
app.use('/api/web/stalls', webStallRoutes);
app.use('/api/web/employees', webEmployeeRoutes);
app.use('/api/web/branches', webBranchRoutes);

// MOBILE ROUTES
app.use('/api/mobile/auth', mobileAuthRoutes);
app.use('/api/mobile/applications', mobileApplicationRoutes);
app.use('/api/mobile/login', mobileLoginRoutes);
app.use('/api/mobile/stalls', mobileStallRoutes);
app.use('/api/mobile/users', mobileUserRoutes);

// Legacy route support for backward compatibility
app.use('/api/auth', webAuthRoutes);
app.use('/api/applications', webApplicationRoutes);
app.use('/api/applicants', webApplicantRoutes);
app.use('/api/stalls', webStallRoutes);
app.use('/api/employees', webEmployeeRoutes);
app.use('/api/branches', webBranchRoutes);

// Error handling middleware
app.use(errorHandler);

// Handle 404 errors
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        availableEndpoints: [
            '/health',
            '/api/web/*',
            '/api/mobile/*'
        ]
    });
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 Unified Naga Stall Backend Server Started');
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌐 Web services: http://localhost:${PORT}/api/web/`);
    console.log(`📱 Mobile services: http://localhost:${PORT}/api/mobile/`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log('');
    console.log('Services Available:');
    console.log('✅ Landing Page Authentication & Applications');
    console.log('✅ Admin Panel Management');
    console.log('✅ Mobile Application API');
    console.log('✅ Email Notifications');
    console.log('✅ Stall Management System');
    console.log('✅ Employee Management');
    console.log('✅ Branch Management');
});

export default app;