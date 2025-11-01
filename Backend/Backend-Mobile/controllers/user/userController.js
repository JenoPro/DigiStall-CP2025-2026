// ===== MOBILE USER CONTROLLER =====
// Simple user management for mobile applications

import { createConnection } from '../../config/database.js';

// Get user profile
export const getUserProfile = async (req, res) => {
  let connection;
  
  try {
    connection = await createConnection();
    const userId = req.user.userId; // From authentication middleware
    
    const [users] = await connection.execute(
      'SELECT applicant_id, first_name, last_name, email, phone_number FROM applicant WHERE applicant_id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: users[0]
    });
    
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  let connection;
  
  try {
    connection = await createConnection();
    const userId = req.user.userId; // From authentication middleware
    const { first_name, last_name, phone_number } = req.body;
    
    // Update user profile
    await connection.execute(
      'UPDATE applicant SET first_name = ?, last_name = ?, phone_number = ? WHERE applicant_id = ?',
      [first_name, last_name, phone_number, userId]
    );
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user profile',
      error: error.message
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};