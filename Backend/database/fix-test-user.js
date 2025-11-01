import { createConnection } from '../config/database.js';
import bcrypt from 'bcryptjs';

async function fixTestUser() {
    let connection;
    
    try {
        console.log('🔄 Connecting to database...');
        connection = await createConnection();
        
        console.log('🔍 Checking current test user...');
        const [users] = await connection.execute(
            'SELECT applicant_id, applicant_username, applicant_password_hash FROM applicant WHERE applicant_username = ?',
            ['25-93276']
        );
        
        if (users.length === 0) {
            console.log('❌ Test user not found');
            return;
        }
        
        console.log('📝 Current user:', users[0]);
        
        console.log('🔐 Generating new password hash...');
        const newPassword = 'password123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        console.log('💾 Updating password...');
        await connection.execute(
            'UPDATE applicant SET applicant_password_hash = ? WHERE applicant_username = ?',
            [hashedPassword, '25-93276']
        );
        
        console.log('✅ Password updated successfully!');
        console.log('📱 Test credentials:');
        console.log('   Username: 25-93276');
        console.log('   Password: password123');
        
        // Test the hash
        console.log('🧪 Testing hash...');
        const isValid = await bcrypt.compare(newPassword, hashedPassword);
        console.log('Hash test result:', isValid ? '✅ Valid' : '❌ Invalid');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

fixTestUser();