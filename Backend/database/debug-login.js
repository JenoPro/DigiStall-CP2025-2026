import { createConnection } from '../config/database.js';
import bcrypt from 'bcryptjs';

async function debugLogin() {
    let connection;
    
    try {
        console.log('🔄 Connecting to database...');
        connection = await createConnection();
        
        const username = '25-93276';
        const password = 'password123';
        
        console.log('🔍 Fetching user from database...');
        const [users] = await connection.execute(
            `SELECT 
                applicant_id, 
                applicant_full_name, 
                applicant_username, 
                applicant_email, 
                applicant_password_hash,
                applicant_contact_number,
                email_verified,
                last_login,
                login_attempts,
                account_locked_until
            FROM applicant 
            WHERE (applicant_username = ? OR applicant_email = ?) 
            AND applicant_password_hash IS NOT NULL`,
            [username, username]
        );
        
        if (users.length === 0) {
            console.log('❌ No user found');
            return;
        }
        
        const user = users[0];
        console.log('👤 User found:', {
            id: user.applicant_id,
            username: user.applicant_username,
            email: user.applicant_email,
            hashLength: user.applicant_password_hash?.length,
            hashStart: user.applicant_password_hash?.substring(0, 10)
        });
        
        console.log('🔐 Testing password comparison...');
        console.log('Input password:', password);
        console.log('Stored hash:', user.applicant_password_hash);
        
        const isValidPassword = await bcrypt.compare(password, user.applicant_password_hash);
        console.log('Comparison result:', isValidPassword ? '✅ VALID' : '❌ INVALID');
        
        // Test with the exact hash we know should work
        console.log('🧪 Testing direct hash comparison...');
        const testHash = await bcrypt.hash(password, 10);
        console.log('New test hash:', testHash);
        const testResult = await bcrypt.compare(password, testHash);
        console.log('New hash test:', testResult ? '✅ VALID' : '❌ INVALID');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

debugLogin();