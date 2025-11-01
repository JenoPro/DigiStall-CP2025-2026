import { createConnection } from '../../config/database.js'

// ===== SUBMIT MOBILE APPLICATION =====
export const submitMobileApplication = async (req, res) => {
  let connection;
  
  try {
    connection = await createConnection();
    const { 
      applicantId, 
      stallId, 
      businessName, 
      businessType, 
      preferredArea,
      documentUrls 
    } = req.body;
    
    // Insert application
    const [result] = await connection.execute(
      `INSERT INTO applications 
       (applicant_id, stall_id, business_name, business_type, preferred_area, 
        document_urls, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [applicantId, stallId, businessName, businessType, preferredArea, JSON.stringify(documentUrls)]
    );
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: result.insertId
    });
    
  } catch (error) {
    console.error('Submit mobile application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// ===== GET MOBILE USER APPLICATIONS =====
export const getMobileUserApplications = async (req, res) => {
  let connection;
  
  try {
    connection = await createConnection();
    const userId = req.user.userId;
    
    const [applications] = await connection.execute(
      `SELECT a.*, s.stall_name, s.area, s.location 
       FROM applications a 
       LEFT JOIN stalls s ON a.stall_id = s.stall_id 
       WHERE a.applicant_id = ? 
       ORDER BY a.created_at DESC`,
      [userId]
    );
    
    res.status(200).json({
      success: true,
      applications
    });
    
  } catch (error) {
    console.error('Get mobile user applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get applications',
      error: error.message
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// ===== GET MOBILE APPLICATION STATUS =====
export const getMobileApplicationStatus = async (req, res) => {
  let connection;
  
  try {
    connection = await createConnection();
    const { id } = req.params;
    const userId = req.user.userId;
    
    const [applications] = await connection.execute(
      `SELECT a.*, s.stall_name, s.area, s.location 
       FROM applications a 
       LEFT JOIN stalls s ON a.stall_id = s.stall_id 
       WHERE a.application_id = ? AND a.applicant_id = ?`,
      [id, userId]
    );
    
    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    res.status(200).json({
      success: true,
      application: applications[0]
    });
    
  } catch (error) {
    console.error('Get mobile application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get application status',
      error: error.message
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// ===== UPDATE MOBILE APPLICATION =====
export const updateMobileApplication = async (req, res) => {
  let connection;
  
  try {
    connection = await createConnection();
    const { id } = req.params;
    const userId = req.user.userId;
    const { 
      businessName, 
      businessType, 
      preferredArea,
      documentUrls 
    } = req.body;
    
    // Check if application belongs to user and is still pending
    const [existing] = await connection.execute(
      'SELECT * FROM applications WHERE application_id = ? AND applicant_id = ? AND status = "pending"',
      [id, userId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or cannot be updated'
      });
    }
    
    // Update application
    await connection.execute(
      `UPDATE applications 
       SET business_name = ?, business_type = ?, preferred_area = ?, 
           document_urls = ?, updated_at = NOW() 
       WHERE application_id = ? AND applicant_id = ?`,
      [businessName, businessType, preferredArea, JSON.stringify(documentUrls), id, userId]
    );
    
    res.status(200).json({
      success: true,
      message: 'Application updated successfully'
    });
    
  } catch (error) {
    console.error('Update mobile application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application',
      error: error.message
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};