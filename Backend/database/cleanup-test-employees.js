import { createConnection } from '../config/database.js';

async function cleanupTestEmployees() {
  const connection = await createConnection();
  
  try {
    console.log('🔍 Current employees in database:');
    const [currentEmployees] = await connection.execute(
      'SELECT employee_id, first_name, last_name, email, branch_id FROM employee'
    );
    console.table(currentEmployees);
    
    console.log('\n❓ Deleting test employees with these emails...');
    console.log('   - laurentejeno73@gmail.com');
    console.log('   - josonglaurente@gmail.com');
    console.log('\n⚠️  WARNING: This will permanently delete these employee records!');
    
    // Delete the test employees
    const [result] = await connection.execute(
      `DELETE FROM employee WHERE email IN (?, ?)`,
      ['laurentejeno73@gmail.com', 'josonglaurente@gmail.com']
    );
    
    console.log(`\n✅ Deleted ${result.affectedRows} test employee record(s)`);
    
    console.log('\n🔍 Remaining employees in database:');
    const [remainingEmployees] = await connection.execute(
      'SELECT employee_id, first_name, last_name, email, branch_id FROM employee'
    );
    
    if (remainingEmployees.length === 0) {
      console.log('   (No employees in database - ready for fresh start!)');
    } else {
      console.table(remainingEmployees);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

cleanupTestEmployees();