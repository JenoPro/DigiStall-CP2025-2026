import { createConnection } from '../config/database.js';
import bcrypt from 'bcryptjs';

async function createTestUser() {
    let connection;
    
    try {
        console.log('🔄 Connecting to database...');
        connection = await createConnection();
        
        console.log('🔐 Generating password hash...');
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        console.log('📝 Creating test user...');
        const [result] = await connection.execute(
            `INSERT INTO applicant (
                applicant_full_name, 
                applicant_contact_number, 
                applicant_address, 
                applicant_username, 
                applicant_email, 
                applicant_password_hash,
                email_verified,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                'John Doe Mobile User',
                '09123456789',
                'Sample Address, Naga City',
                '25-93276',
                'john.mobile@example.com',
                hashedPassword,
                true
            ]
        );
        
        console.log('✅ Test user created successfully!');
        console.log('New user ID:', result.insertId);
        
        console.log('🧪 Verifying the user...');
        const [users] = await connection.execute(
            'SELECT applicant_id, applicant_username, applicant_email, applicant_password_hash FROM applicant WHERE applicant_username = ?',
            ['25-93276']
        );
        
        if (users.length > 0) {
            console.log('✅ User verification successful:', {
                id: users[0].applicant_id,
                username: users[0].applicant_username,
                email: users[0].applicant_email,
                hasPassword: !!users[0].applicant_password_hash
            });
            
            // Test password
            console.log('🧪 Testing password...');
            const isValid = await bcrypt.compare(password, users[0].applicant_password_hash);
            console.log('Password test:', isValid ? '✅ VALID' : '❌ INVALID');
        } else {
            console.log('❌ User verification failed');
        }
        
        console.log('📱 Login credentials:');
        console.log('   Username: 25-93276');
        console.log('   Password: password123');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

createTestUser();