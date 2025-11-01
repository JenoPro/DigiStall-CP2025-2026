// Simple database test to check existing users
import { createConnection } from './config/database.js';

async function testDatabase() {
    let connection;
    try {
        console.log('🔍 Connecting to database...');
        connection = await createConnection();
        
        console.log('✅ Database connected successfully');
        
        // Check admin table
        console.log('\n📋 Checking admin table...');
        const [admins] = await connection.execute('SELECT admin_id, admin_username, first_name, last_name, status FROM admin LIMIT 5');
        console.log('Admins found:', admins.length);
        admins.forEach(admin => {
            console.log(`  - ${admin.admin_username} (${admin.first_name} ${admin.last_name}) - ${admin.status}`);
        });

        // Check branch_manager table
        console.log('\n📋 Checking branch_manager table...');
        const [managers] = await connection.execute('SELECT branch_manager_id, manager_username, first_name, last_name, status FROM branch_manager LIMIT 5');
        console.log('Branch Managers found:', managers.length);
        managers.forEach(manager => {
            console.log(`  - ${manager.manager_username} (${manager.first_name} ${manager.last_name}) - ${manager.status}`);
        });

        // Check employee table
        console.log('\n📋 Checking employee table...');
        const [employees] = await connection.execute('SELECT employee_id, employee_username, first_name, last_name, status FROM employee LIMIT 5');
        console.log('Employees found:', employees.length);
        employees.forEach(employee => {
            console.log(`  - ${employee.employee_username} (${employee.first_name} ${employee.last_name}) - ${employee.status}`);
        });

        console.log('\n✅ Database test completed');
        
    } catch (error) {
        console.error('❌ Database test error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testDatabase();