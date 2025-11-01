import { createConnection } from '../config/database.js';

async function addAuthFields() {
    let connection;
    
    try {
        console.log('🔄 Connecting to database...');
        connection = await createConnection();
        
        console.log('🚀 Adding authentication fields to applicant table...');
        
        // Add authentication columns one by one
        const alterStatements = [
            "ALTER TABLE `applicant` ADD COLUMN IF NOT EXISTS `applicant_username` VARCHAR(50) UNIQUE NULL COMMENT 'Mobile login username'",
            "ALTER TABLE `applicant` ADD COLUMN IF NOT EXISTS `applicant_email` VARCHAR(100) UNIQUE NULL COMMENT 'Mobile login email'",
            "ALTER TABLE `applicant` ADD COLUMN IF NOT EXISTS `applicant_password_hash` VARCHAR(255) NULL COMMENT 'Hashed password for mobile login'",
            "ALTER TABLE `applicant` ADD COLUMN IF NOT EXISTS `email_verified` BOOLEAN DEFAULT FALSE COMMENT 'Email verification status'",
            "ALTER TABLE `applicant` ADD COLUMN IF NOT EXISTS `last_login` TIMESTAMP NULL COMMENT 'Last login timestamp'",
            "ALTER TABLE `applicant` ADD COLUMN IF NOT EXISTS `login_attempts` INT DEFAULT 0 COMMENT 'Failed login attempts counter'",
            "ALTER TABLE `applicant` ADD COLUMN IF NOT EXISTS `account_locked_until` TIMESTAMP NULL COMMENT 'Account lock expiration time'"
        ];
        
        for (const statement of alterStatements) {
            try {
                console.log('Executing:', statement.substring(0, 60) + '...');
                await connection.execute(statement);
                console.log('✅ Success');
            } catch (error) {
                if (error.message.includes('Duplicate column name')) {
                    console.log('ℹ️  Column already exists, skipping');
                } else {
                    console.error('❌ Error:', error.message);
                }
            }
        }
        
        // Add indexes
        const indexStatements = [
            "CREATE INDEX IF NOT EXISTS `idx_applicant_username` ON `applicant` (`applicant_username`)",
            "CREATE INDEX IF NOT EXISTS `idx_applicant_email` ON `applicant` (`applicant_email`)"
        ];
        
        for (const statement of indexStatements) {
            try {
                console.log('Creating index...');
                await connection.execute(statement);
                console.log('✅ Index created');
            } catch (error) {
                if (error.message.includes('Duplicate key name')) {
                    console.log('ℹ️  Index already exists, skipping');
                } else {
                    console.error('❌ Index error:', error.message);
                }
            }
        }
        
        // Insert test user
        console.log('📝 Adding test user...');
        const bcrypt = await import('bcrypt');
        const hashedPassword = await bcrypt.default.hash('password123', 10);
        
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
        
    } catch (error) {
        console.error('❌ Setup failed:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

addAuthFields();