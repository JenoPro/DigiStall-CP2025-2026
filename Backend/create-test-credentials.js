// Quick script to add test credentials for mobile app
import { createConnection } from './config/database.js';
import bcrypt from 'bcryptjs';

async function addTestCredentials() {
  let connection;
  try {
    connection = await createConnection();
    
    // Create test password hash
    const testPassword = 'password123';
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(testPassword, saltRounds);
    
    // First, check if user already exists
    const [existing] = await connection.execute(
      'SELECT * FROM credential WHERE user_name = ?',
      ['25-93276']
    );
    
    if (existing.length > 0) {
      console.log('✅ Test user already exists with ID:', existing[0].registrationid);
      console.log('📱 Username: 25-93276');
      console.log('🔑 Password: password123');
      return;
    }
    
    // Find an applicant ID to use (preferably existing one)
    const [applicants] = await connection.execute(
      'SELECT applicant_id FROM applicant LIMIT 1'
    );
    
    if (applicants.length === 0) {
      console.log('❌ No applicants found. Please create an applicant first.');
      return;
    }
    
    const applicantId = applicants[0].applicant_id;
    
    // Insert test credentials
    const [result] = await connection.execute(
      `INSERT INTO credential (applicant_id, user_name, password_hash, created_date, is_active) 
       VALUES (?, ?, ?, NOW(), 1)`,
      [applicantId, '25-93276', passwordHash]
    );
    
    console.log('✅ Test credentials created successfully!');
    console.log('📱 Registration ID:', result.insertId);
    console.log('👤 Applicant ID:', applicantId);
    console.log('📱 Username: 25-93276');
    console.log('🔑 Password: password123');
    console.log('🔐 Password Hash (first 20 chars):', passwordHash.substring(0, 20) + '...');
    
  } catch (error) {
    console.error('❌ Error creating test credentials:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addTestCredentials();