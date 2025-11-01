import { createConnection } from '../config/database.js';

async function checkDatabase() {
    let connection;
    
    try {
        console.log('🔄 Connecting to database...');
        connection = await createConnection();
        
        console.log('🔍 Checking applicant table structure...');
        const [columns] = await connection.execute('DESCRIBE applicant');
        console.log('Table columns:', columns.map(col => col.Field));
        
        console.log('🔍 Checking all applicants...');
        const [allApplicants] = await connection.execute('SELECT * FROM applicant');
        console.log('Total applicants:', allApplicants.length);
        
        allApplicants.forEach((applicant, index) => {
            console.log(`Applicant ${index + 1}:`, {
                id: applicant.applicant_id,
                name: applicant.applicant_full_name,
                username: applicant.applicant_username,
                email: applicant.applicant_email,
                hasPassword: !!applicant.applicant_password_hash
            });
        });
        
        console.log('🔍 Checking specific user...');
        const [specificUser] = await connection.execute(
            'SELECT * FROM applicant WHERE applicant_username = ?',
            ['25-93276']
        );
        
        if (specificUser.length > 0) {
            console.log('Specific user found:', specificUser[0]);
        } else {
            console.log('❌ Specific user not found');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkDatabase();