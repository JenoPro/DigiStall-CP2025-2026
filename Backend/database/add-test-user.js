import { createConnection } from '../config/database.js';

async function addTestUser() {
    let connection;
    
    try {
        console.log('🔄 Connecting to database...');
        connection = await createConnection();
        
        console.log('📝 Adding test user...');
        
        // Pre-hashed password for 'password123' using bcrypt with salt rounds 10
        const hashedPassword = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
        
        const insertStatement = `
            INSERT IGNORE INTO applicant (
                applicant_full_name, 
                applicant_contact_number, 
                applicant_address, 
                applicant_username, 
                applicant_email, 
                applicant_password_hash,
                email_verified
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        await connection.execute(insertStatement, [
            'John Doe Mobile User',
            '09123456789',
            'Sample Address, Naga City',
            '25-93276',
            'john.mobile@example.com',
            hashedPassword,
            true
        ]);
        
        console.log('✅ Test user added successfully!');
        console.log('📱 You can now login with:');
        console.log('   Username: 25-93276');
        console.log('   Password: password123');
        
        // Verify the user was created
        const [users] = await connection.execute(
            'SELECT applicant_id, applicant_full_name, applicant_username, applicant_email FROM applicant WHERE applicant_username = ?',
            ['25-93276']
        );
        
        if (users.length > 0) {
            console.log('✅ User verification successful:', users[0]);
        } else {
            console.log('❌ User not found after creation');
        }
        
    } catch (error) {
        console.error('❌ Setup failed:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

addTestUser();