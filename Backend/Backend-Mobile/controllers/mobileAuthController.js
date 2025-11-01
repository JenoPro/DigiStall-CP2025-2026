import { createConnection } from '../../config/database.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// ===== MOBILE LOGIN =====
export const mobileLogin = async (req, res) => {
  let connection;
  
  try {
    connection = await createConnection();
    const { username, password } = req.body;
    
    // Query mobile users (assuming applicants table for mobile users)
    const [users] = await connection.execute(
      'SELECT * FROM applicants WHERE username = ? OR email = ?',
      [username, username]
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const user = users[0];
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.applicant_id,
        username: user.username,
        email: user.email,
        userType: 'mobile_user'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.applicant_id,
        username: user.username,
        email: user.email,
        userType: 'mobile_user'
      }
    });
    
  } catch (error) {
    console.error('Mobile login error:', error);
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

// ===== MOBILE REGISTER =====
export const mobileRegister = async (req, res) => {
  let connection;
  
  try {
    connection = await createConnection();
    const { username, email, password, firstName, lastName, phoneNumber } = req.body;
    
    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT * FROM applicants WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new mobile user
    const [result] = await connection.execute(
      'INSERT INTO applicants (username, email, password, first_name, last_name, phone_number, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [username, email, hashedPassword, firstName, lastName, phoneNumber]
    );
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: result.insertId,
        username,
        email
      }
    });
    
  } catch (error) {
    console.error('Mobile registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// ===== MOBILE VERIFY TOKEN =====
export const mobileVerifyToken = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      user: decoded
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// ===== MOBILE LOGOUT =====
export const mobileLogout = async (req, res) => {
  // Since we're using stateless JWT, logout is handled client-side
  res.status(200).json({
    success: true,
    message: 'Logout successful. Please remove the token from client storage.'
  });
};