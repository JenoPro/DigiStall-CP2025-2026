// Create test users and test login endpoints
import { createConnection } from './config/database.js';
import bcrypt from 'bcryptjs';

async function createTestUsers() {
    let connection;
    try {
        console.log('🔧 Creating test users...');
        connection = await createConnection();
        
        const testPassword = 'test123';
        const hashedPassword = await bcrypt.hash(testPassword, 12);
        
        // Create test admin (if not exists)
        console.log('👤 Checking admin user...');
        const [existingAdmin] = await connection.execute('SELECT admin_id FROM admin WHERE admin_username = ?', ['testadmin']);
        if (existingAdmin.length === 0) {
            await connection.execute(
                'INSERT INTO admin (admin_username, admin_password_hash, first_name, last_name, email, status) VALUES (?, ?, ?, ?, ?, ?)',
                ['testadmin', hashedPassword, 'Test', 'Admin', 'admin@test.com', 'Active']
            );
            console.log('✅ Created test admin: testadmin / test123');
        } else {
            console.log('✅ Admin user already exists: testadmin');
        }

        // Create test branch manager (if not exists)
        console.log('👤 Checking branch manager...');
        const [existingBM] = await connection.execute('SELECT branch_manager_id FROM branch_manager WHERE manager_username = ?', ['testmanager']);
        if (existingBM.length === 0) {
            // First, ensure we have a branch
            const [branches] = await connection.execute('SELECT branch_id FROM branch LIMIT 1');
            if (branches.length > 0) {
                await connection.execute(
                    'INSERT INTO branch_manager (branch_id, manager_username, manager_password_hash, first_name, last_name, email, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [branches[0].branch_id, 'testmanager', hashedPassword, 'Test', 'Manager', 'manager@test.com', 'Active']
                );
                console.log('✅ Created test branch manager: testmanager / test123');
            } else {
                console.log('❌ No branches available for branch manager');
            }
        } else {
            console.log('✅ Branch manager already exists: testmanager');
        }

        // Create test employee (if not exists)
        console.log('👤 Checking employee...');
        const [existingEmp] = await connection.execute('SELECT employee_id FROM employee WHERE employee_username = ?', ['testemployee']);
        if (existingEmp.length === 0) {
            // First, ensure we have a branch
            const [branches] = await connection.execute('SELECT branch_id FROM branch LIMIT 1');
            if (branches.length > 0) {
                await connection.execute(
                    'INSERT INTO employee (branch_id, employee_username, employee_password_hash, first_name, last_name, email, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [branches[0].branch_id, 'testemployee', hashedPassword, 'Test', 'Employee', 'employee@test.com', 'Active']
                );
                console.log('✅ Created test employee: testemployee / test123');
            } else {
                console.log('❌ No branches available for employee');
            }
        } else {
            console.log('✅ Employee already exists: testemployee');
        }

        console.log('\n🎯 Test Credentials:');
        console.log('  Admin:          testadmin / test123');
        console.log('  Branch Manager: testmanager / test123');
        console.log('  Employee:       testemployee / test123');
        
    } catch (error) {
        console.error('❌ Error creating test users:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

createTestUsers();