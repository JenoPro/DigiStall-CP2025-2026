// ===== UNIFIED AUTHENTICATION CONTROLLER =====
// Single clean authentication system for all user types

import { createConnection } from '../../config/database.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// ===== UNIFIED LOGIN ENDPOINT =====
export const login = async (req, res) => {
  let connection;
  
  try {
    connection = await createConnection();
    
    const { email, password, userType } = req.body;
    
    console.log('🔐 Unified Login Attempt:', { email, userType, timestamp: new Date().toISOString() });
    
    // Validate required fields
    if (!email || !password || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and user type are required'
      });
    }
    
    let user = null;
    let tableName = '';
    let userIdField = '';
    
    // Determine which table to query based on user type
    switch (userType.toLowerCase()) {
      case 'admin':
        tableName = 'admin';
        userIdField = 'admin_id';
        break;
      case 'branch_manager':
        tableName = 'branch_manager';
        userIdField = 'manager_id';
        break;
      case 'employee':
        tableName = 'employee';
        userIdField = 'employee_id';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid user type. Must be admin, branch_manager, or employee'
        });
    }
    
    // Query the appropriate table
    const [userRows] = await connection.execute(
      `SELECT * FROM ${tableName} WHERE email = ? AND status = 'Active'`,
      [email]
    );
    
    if (userRows.length === 0) {
      console.log(`❌ ${userType} not found:`, email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or inactive account'
      });
    }
    
    user = userRows[0];
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`❌ Invalid password for ${userType}:`, email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Get additional user information based on type
    let additionalUserInfo = {};
    
    if (userType.toLowerCase() === 'branch_manager' || userType.toLowerCase() === 'employee') {
      // Get branch information
      const [branchRows] = await connection.execute(
        'SELECT branch_id, branch_name FROM branch WHERE branch_id = ?',
        [user.branch_id]
      );
      
      if (branchRows.length > 0) {
        additionalUserInfo.branch = branchRows[0];
      }
      
      // Get employee permissions if user is employee
      if (userType.toLowerCase() === 'employee') {
        additionalUserInfo.permissions = {
          read_stalls: user.read_stalls === 1,
          write_stalls: user.write_stalls === 1,
          manage_applicants: user.manage_applicants === 1,
          manage_payments: user.manage_payments === 1,
          view_reports: user.view_reports === 1
        };
      }
    }
    
    // Create JWT token
    const tokenPayload = {
      userId: user[userIdField],
      userType: userType.toLowerCase(),
      email: user.email,
      branchId: user.branch_id || null,
      permissions: additionalUserInfo.permissions || null
    };
    
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    // Prepare user data for response (exclude password)
    const userData = {
      id: user[userIdField],
      userType: userType.toLowerCase(),
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      ...additionalUserInfo
    };
    
    console.log(`✅ ${userType} login successful:`, email);
    
    res.status(200).json({
      success: true,
      message: `${userType} login successful`,
      data: {
        user: userData,
        token: token
      }
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// ===== VERIFY TOKEN =====
export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        user: decoded,
        isValid: true
      }
    });
    
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      isValid: false
    });
  }
};

// ===== GET CURRENT USER =====
export const getCurrentUser = async (req, res) => {
  let connection;
  
  try {
    connection = await createConnection();
    
    // Validate that req.user exists and has required fields
    if (!req.user) {
      console.error('❌ req.user is missing');
      return res.status(401).json({
        success: false,
        message: 'Authentication data missing'
      });
    }
    
    const { userId, userType } = req.user;
    
    // Validate required fields
    if (!userId || !userType) {
      console.error('❌ Missing userId or userType:', { userId, userType });
      return res.status(400).json({
        success: false,
        message: 'User ID and type are required'
      });
    }
    
    console.log('🔍 getCurrentUser called with:', { userId, userType });
    
    let tableName = '';
    let userIdField = '';
    
    switch (userType) {
      case 'admin':
        tableName = 'admin';
        userIdField = 'admin_id';
        break;
      case 'branch_manager':
        tableName = 'branch_manager';
        userIdField = 'branch_manager_id';
        break;
      case 'employee':
        tableName = 'employee';
        userIdField = 'employee_id';
        break;
      default:
        console.error('❌ Invalid userType:', userType);
        return res.status(400).json({
          success: false,
          message: `Invalid user type: ${userType}`
        });
    }
    
    const [userRows] = await connection.execute(
      `SELECT * FROM ${tableName} WHERE ${userIdField} = ?`,
      [userId]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const user = userRows[0];
    
    // Remove password from response
    delete user.password;
    
    // Return data in the format expected by frontend based on user type
    const responseData = {
      success: true,
      data: user
    };
    
    // Add user-type specific keys for backward compatibility
    if (userType === 'branch_manager') {
      responseData.branchManager = user;
    } else if (userType === 'admin') {
      responseData.admin = user;
    } else if (userType === 'employee') {
      responseData.employee = user;
    }
    
    res.status(200).json(responseData);
    
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information',
      error: error.message
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// ===== LOGOUT =====
export const logout = async (req, res) => {
  // Since we're using stateless JWT, logout is handled client-side
  // The client should remove the token from storage
  
  res.status(200).json({
    success: true,
    message: 'Logout successful. Please remove the token from client storage.'
  });
};