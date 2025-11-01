# Naga Stall Management System - Unified Backend

## Overview

This is the unified backend server for the Naga Stall Management System, combining both Landing Page and Management functionality into a single, comprehensive API server.

## Features

- **Landing Page API**: Public stall browsing and application submission
- **Management API**: Admin panel, employee management, and branch operations  
- **Authentication**: JWT-based authentication with role-based access control
- **Database**: MySQL database with optimized queries
- **Mobile Support**: API endpoints compatible with mobile applications

## Project Structure

```
Backend-Web/
├── config/
│   ├── database.js          # Database connection configuration
│   └── cors.js              # CORS policy configuration
├── controllers/
│   ├── applicants/          # Applicant management (from Management backend)
│   ├── applications.js      # Application processing (from Landing backend)
│   ├── auth/                # Authentication controllers
│   ├── branch/              # Branch and location management
│   ├── employees/           # Employee management
│   ├── stalls.js           # Unified stall management (Management backend)
│   └── stallsLanding/      # Landing page stall controllers
├── middleware/
│   ├── auth.js             # JWT authentication middleware
│   └── errorHandler.js     # Global error handling
├── routes/
│   ├── applicantRoutes.js  # Applicant-related routes
│   ├── applicationRoutes.js # Application submission routes
│   ├── authRoutes.js       # Authentication routes
│   ├── branchRoutes.js     # Branch management routes
│   ├── employeeRoutes.js   # Employee management routes
│   └── stallRoutes.js      # Stall management routes
├── services/
│   └── emailService.js     # Email notification service
├── server.js               # Main application server
├── package.json           # Dependencies and scripts
└── .env.example           # Environment variables template
```

## Installation

1. **Navigate to the backend directory:**
   ```bash
   cd Backend/Backend-Web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual configuration values
   ```

4. **Set up the database:**
   - Ensure MySQL is running
   - Create the database: `stall_management_system`
   - Import the database schema (located in `../database/`)

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure the following:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=stall_management_system

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h

# Email (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server
PORT=5000
NODE_ENV=development
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

## API Endpoints

### Public Endpoints (No Authentication)

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify JWT token

#### Stalls (Landing Page)
- `GET /api/stalls` - Browse available stalls
- `GET /api/stalls/:id` - Get stall details
- `GET /api/stalls/area/:area` - Get stalls by area
- `GET /api/stalls/branch/:branchId` - Get stalls by branch

#### Applications
- `POST /api/applications` - Submit stall application
- `GET /api/applications/:id` - Get application status

### Protected Endpoints (Authentication Required)

#### Applicants Management
- `GET /api/applicants` - Get all applicants
- `GET /api/applicants/:id` - Get applicant details
- `PUT /api/applicants/:id` - Update applicant
- `DELETE /api/applicants/:id` - Delete applicant
- `POST /api/applicants/approve/:id` - Approve applicant
- `POST /api/applicants/decline/:id` - Decline applicant

#### Branch Management
- `GET /api/branches` - Get all branches
- `POST /api/branches` - Create new branch
- `GET /api/branches/:id` - Get branch details
- `PUT /api/branches/:id` - Update branch
- `DELETE /api/branches/:id` - Delete branch

#### Employee Management
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create new employee
- `GET /api/employees/:id` - Get employee details
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

#### Stall Management (Admin)
- `POST /api/stalls` - Create new stall
- `PUT /api/stalls/:id` - Update stall
- `DELETE /api/stalls/:id` - Delete stall

## Authentication & Authorization

### User Types
- **Admin**: Full system access
- **Branch Manager**: Branch-specific management access
- **Employee**: Limited access based on permissions

### JWT Token Structure
```json
{
  "userId": 123,
  "userType": "admin|branch_manager|employee",
  "branchId": 456,
  "permissions": ["read_stalls", "write_stalls", "manage_applicants"],
  "iat": 1234567890,
  "exp": 1234567890
}
```

## Error Handling

The API uses standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (in development)",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Health Check

Check server and database status:
```
GET /api/health
```

Response:
```json
{
  "success": true,
  "message": "Server and database are healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "server": "running",
    "database": "connected"
  }
}
```

## Database Integration

The backend connects to the MySQL database located in `../database/`. 

### Key Database Features:
- Connection pooling for performance
- Prepared statements for security
- Transaction support for data integrity
- Automatic connection cleanup

## Migration from Separate Backends

This unified backend combines:

1. **Naga-Stall-Management Backend**:
   - Admin panel functionality
   - Employee management
   - Branch management
   - Applicant processing

2. **Naga-Stall-Landingpage Backend**:
   - Public stall browsing
   - Application submission
   - Basic applicant functions

### Key Improvements:
- ✅ **Fixed Employee Stall Creation**: Employees can now create stalls properly
- ✅ **Unified Database Access**: Single database connection configuration
- ✅ **Consolidated Authentication**: Shared JWT authentication across all features
- ✅ **Better Error Handling**: Comprehensive error handling and logging
- ✅ **Improved Performance**: Optimized database queries and connection pooling

## Development

### Code Structure Guidelines:
- Controllers handle business logic
- Services handle external integrations (email, etc.)
- Middleware handles cross-cutting concerns (auth, CORS, etc.)
- Routes define API endpoints and validation

### Best Practices:
- Use async/await for database operations
- Always close database connections
- Validate input data
- Use proper HTTP status codes
- Log important operations

## Testing

Health check endpoint for testing:
```bash
curl http://localhost:5000/api/health
```

## Support

For issues and questions:
- Check server logs for detailed error information
- Verify database connectivity
- Ensure all environment variables are properly set
- Confirm JWT tokens are being passed correctly in headers

## Version History

- **v1.0.0**: Initial unified backend release
  - Combined Landing Page and Management backends
  - Fixed employee stall creation issues
  - Improved authentication system
  - Enhanced error handling