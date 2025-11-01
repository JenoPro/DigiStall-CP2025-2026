// Mobile Controller for credential-based login and application submission
import bcrypt from 'bcrypt'
import { createConnection } from '../config/database.js'

// Mobile login function - authenticates using credential table
export const mobileLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const connection = await createConnection();

    try {
      // Query the credential table for the user
      const [credentialRows] = await connection.execute(
        'SELECT * FROM credential WHERE username = ?',
        [username]
      );

      if (credentialRows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      const credential = credentialRows[0];

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, credential.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      // Get applicant data
      const [applicantRows] = await connection.execute(
        'SELECT * FROM applicant WHERE applicant_id = ?',
        [credential.applicant_id]
      );

      if (applicantRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Applicant data not found'
        });
      }

      const applicant = applicantRows[0];

      // Get user's applications
      const [applicationRows] = await connection.execute(
        `SELECT a.*, s.stall_no, b.branch_name, s.stall_location, s.size, s.rental_price, s.price_type, s.description,
                f.floor_name, sec.section_name
         FROM application a
         LEFT JOIN stall s ON a.stall_id = s.stall_id
         LEFT JOIN branch b ON s.branch_id = b.branch_id
         LEFT JOIN floor f ON s.floor_id = f.floor_id
         LEFT JOIN section sec ON s.section_id = sec.section_id
         WHERE a.applicant_id = ?`,
        [credential.applicant_id]
      );

      // Get available stalls in user's area
      const [stallRows] = await connection.execute(
        `SELECT s.*, b.branch_name, b.area, f.floor_name, sec.section_name,
                CASE 
                  WHEN s.availability_status = 'Available' THEN 'available'
                  ELSE 'locked'
                END as status
         FROM stall s
         JOIN branch b ON s.branch_id = b.branch_id
         LEFT JOIN floor f ON s.floor_id = f.floor_id
         LEFT JOIN section sec ON s.section_id = sec.section_id
         WHERE b.area = ? AND s.availability_status = 'Available'`,
        [applicant.area]
      );

      // Transform stalls data for mobile app
      const available_stalls = stallRows.map(stall => {
        const userApplicationsInBranch = applicationRows.filter(app => app.branch_id === stall.branch_id).length;
        const hasApplied = applicationRows.some(app => app.stall_id === stall.stall_id);
        const maxApplicationsReached = userApplicationsInBranch >= 2;

        return {
          id: stall.stall_id,
          stallNumber: stall.stall_no,
          location: stall.branch_name,
          floor: `${stall.floor_name || 'Floor'} / ${stall.section_name || 'Section'}`,
          size: stall.size,
          price: `₱${stall.rental_price}`,
          priceValue: stall.rental_price,
          priceType: stall.price_type || 'Fixed Price',
          description: stall.description,
          status: hasApplied ? 'applied' : 'available',
          canApply: !hasApplied && !maxApplicationsReached,
          maxApplicationsReached,
          applicationsInBranch: userApplicationsInBranch,
          branchId: stall.branch_id,
          stallLocation: stall.stall_location,
          image: stall.image_url || 'https://via.placeholder.com/300x200'
        };
      });

      // Prepare response data
      const responseData = {
        user: {
          applicant_id: applicant.applicant_id,
          name: `${applicant.first_name} ${applicant.last_name}`,
          first_name: applicant.first_name,
          last_name: applicant.last_name,
          email: applicant.email,
          phone: applicant.contact_number,
          area: applicant.area,
          username: credential.username
        },
        applications: {
          my_applications: applicationRows,
          total_applications: applicationRows.length,
          applications_by_branch: applicationRows.reduce((acc, app) => {
            acc[app.branch_name] = (acc[app.branch_name] || 0) + 1;
            return acc;
          }, {})
        },
        stalls: {
          available_stalls,
          total_available: available_stalls.length,
          user_area: applicant.area
        },
        ui_state: {
          can_apply_more: applicationRows.length < 10, // Overall limit
          areas_with_space: Object.keys(
            applicationRows.reduce((acc, app) => {
              if (!acc[app.branch_name]) acc[app.branch_name] = 0;
              acc[app.branch_name]++;
              return acc;
            }, {})
          ).filter(branch => {
            const count = applicationRows.filter(app => app.branch_name === branch).length;
            return count < 2;
          })
        }
      };

      res.json({
        success: true,
        message: 'Login successful',
        data: responseData
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Mobile login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred'
    });
  }
};

// Submit application function
export const submitApplication = async (req, res) => {
  try {
    const { applicant_id, stall_id } = req.body;

    if (!applicant_id || !stall_id) {
      return res.status(400).json({
        success: false,
        message: 'Applicant ID and Stall ID are required'
      });
    }

    const connection = await createConnection();

    try {
      // Check if already applied
      const [existingRows] = await connection.execute(
        'SELECT * FROM application WHERE applicant_id = ? AND stall_id = ?',
        [applicant_id, stall_id]
      );

      if (existingRows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'You have already applied to this stall'
        });
      }

      // Get stall info to check branch
      const [stallRows] = await connection.execute(
        'SELECT * FROM stall WHERE stall_id = ?',
        [stall_id]
      );

      if (stallRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Stall not found'
        });
      }

      const stall = stallRows[0];

      // Check application limit for this branch (2 per branch)
      const [branchApplications] = await connection.execute(
        `SELECT COUNT(*) as count FROM application a 
         JOIN stall s ON a.stall_id = s.stall_id 
         WHERE a.applicant_id = ? AND s.branch_id = ?`,
        [applicant_id, stall.branch_id]
      );

      if (branchApplications[0].count >= 2) {
        return res.status(400).json({
          success: false,
          message: 'You have reached the maximum of 2 applications for this branch'
        });
      }

      // Create application
      const [result] = await connection.execute(
        `INSERT INTO application (applicant_id, stall_id, application_date, application_status) 
         VALUES (?, ?, CURDATE(), 'Pending')`,
        [applicant_id, stall_id]
      );

      res.json({
        success: true,
        message: 'Application submitted successfully',
        data: {
          application_id: result.insertId,
          applicant_id,
          stall_id,
          application_status: 'Pending'
        }
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred'
    });
  }
};