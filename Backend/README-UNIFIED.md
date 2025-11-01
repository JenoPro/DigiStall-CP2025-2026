# Naga Stall Management System - Unified Backend

## 🚀 Overview

This is the **unified backend server** for the Naga Stall Management System that serves all three platforms from a single server instance:

- **Landing Page** - Public application portal
- **Admin Panel** - Management dashboard  
- **Mobile Application** - Mobile app API

## 🏗️ Architecture

```
Backend/
├── unified-server.js          # Main unified server entry point
├── start-unified.js           # Startup script
├── package-unified.json       # Unified dependencies
├── Backend-Web/               # Web services (Landing + Admin)
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   └── middleware/
├── Backend-Mobile/            # Mobile services
│   ├── controllers/
│   ├── routes/
│   └── services/
├── config/                    # Shared configuration
├── middleware/                # Shared middleware
└── database/                  # Database files and migrations
```

## 🌐 API Endpoints

### Web Services (Landing Page & Admin)
- `GET /api/web/auth/*` - Web authentication
- `GET /api/web/applications/*` - Application management
- `GET /api/web/applicants/*` - Applicant management
- `GET /api/web/stalls/*` - Stall management
- `GET /api/web/employees/*` - Employee management
- `GET /api/web/branches/*` - Branch management

### Mobile Services
- `GET /api/mobile/auth/*` - Mobile authentication
- `GET /api/mobile/applications/*` - Mobile applications
- `GET /api/mobile/stalls/*` - Mobile stall access
- `GET /api/mobile/users/*` - Mobile user management

### Legacy Support
- `GET /api/*` - Backwards compatible endpoints

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Copy the unified package.json
cp package-unified.json package.json

# Install dependencies
npm install
```

### 2. Environment Setup
Create a `.env` file:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=naga_stall_management
JWT_SECRET=your_jwt_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 3. Database Setup
```bash
# Run database migrations
mysql -u root -p naga_stall_management < database/naga_stall_complete.sql
```

### 4. Start the Server

#### Production Mode
```bash
npm start
# or
node unified-server.js
```

#### Development Mode
```bash
npm run dev
# or
nodemon unified-server.js
```

## 📡 Server Information

Once started, the server will display:
```
🚀 Unified Naga Stall Backend Server Started
📡 Server running on port 3000
🌐 Web services: http://localhost:3000/api/web/
📱 Mobile services: http://localhost:3000/api/mobile/
🏥 Health check: http://localhost:3000/health

Services Available:
✅ Landing Page Authentication & Applications
✅ Admin Panel Management
✅ Mobile Application API
✅ Email Notifications
✅ Stall Management System
✅ Employee Management
✅ Branch Management
```

## 🏥 Health Check

Check server status:
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "OK",
  "message": "Unified Naga Stall Backend Server Running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "web": "Landing Page & Admin Panel",
    "mobile": "Mobile Application"
  }
}
```

## 🔧 Features

### ✅ Implemented Features
- **Unified Server Architecture** - Single server for all platforms
- **CORS Configuration** - Multi-origin support for different frontends
- **Email Service** - Application notifications and confirmations
- **Database Connection Pooling** - Optimized MySQL connections
- **Error Handling** - Centralized error management
- **Authentication** - JWT-based auth for web and mobile
- **Employee Management** - Complete CRUD operations
- **Stall Management** - Comprehensive stall system with raffle/auction
- **Application Processing** - Automated workflow with email notifications

### 🔄 Route Structure
- **Modular Routes** - Separated by platform (web/mobile)
- **Legacy Support** - Backwards compatibility maintained
- **RESTful Design** - Standard HTTP methods and status codes
- **Middleware Integration** - Authentication and error handling

## 🗄️ Database

The system uses MySQL with the following key tables:
- `employee` - Employee management
- `stall` - Stall information and management
- `application` - Application submissions
- `applicant` - Applicant profiles
- `branch` - Branch management
- `auction` - Auction system
- `raffle` - Raffle system

## 📧 Email Integration

Automated email notifications for:
- Application confirmations
- Status updates (approved/rejected)
- Employee account creation
- Password resets

## 🔐 Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Tokens** - Secure authentication
- **Input Validation** - Request data validation
- **CORS Protection** - Origin-based access control
- **SQL Injection Prevention** - Parameterized queries

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check database credentials in .env
   # Ensure MySQL service is running
   # Verify database exists
   ```

2. **Port Already in Use**
   ```bash
   # Change PORT in .env file
   # Or kill process using port 3000
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

3. **Module Import Errors**
   ```bash
   # Ensure package.json has "type": "module"
   # Check all import paths are correct
   # Run npm install
   ```

## 📝 Logs

Server logs include:
- Request/response information
- Database connection status
- Error details with stack traces
- Service startup confirmation

## 🔄 Development

### Adding New Routes
1. Create controller in appropriate Backend-Web or Backend-Mobile
2. Create route file
3. Import and register in unified-server.js

### Database Changes
1. Create migration file in database/migrations/
2. Update database schema
3. Test with development data

## 📞 Support

For technical support or questions about the unified backend:
- Check logs for error details
- Verify database connectivity
- Ensure all dependencies are installed
- Review environment configuration

---

**Version:** 2.0.0  
**Last Updated:** January 2025  
**Platform:** Node.js + Express + MySQL