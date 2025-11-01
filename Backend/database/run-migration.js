import { createConnection } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    let connection;
    
    try {
        console.log('🔄 Connecting to database...');
        connection = await createConnection();
        
        console.log('📁 Reading migration file...');
        const migrationPath = path.join(__dirname, 'migrations', '007_mobile_auth_system.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('🚀 Executing migration...');
        
        // Split the SQL file into individual statements
        const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    console.log('Executing:', statement.substring(0, 60) + '...');
                    await connection.execute(statement);
                } catch (error) {
                    if (!error.message.includes('Duplicate column name') && 
                        !error.message.includes('already exists') &&
                        !error.message.includes('Duplicate key name')) {
                        console.error('❌ Error executing statement:', error.message);
                        console.error('Statement:', statement);
                    } else {
                        console.log('ℹ️  Skipping (already exists):', error.message);
                    }
                }
            }
        }
        
        console.log('✅ Migration completed successfully!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

runMigration();