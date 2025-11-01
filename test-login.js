// Test login endpoint directly
const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('🔄 Testing login endpoint...');
    
    const response = await fetch('http://localhost:3001/mobile/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: '25-93276',
        password: 'password123'
      }),
    });

    console.log('📡 Response status:', response.status);
    const data = await response.json();
    
    console.log('📊 Response data structure:');
    console.log('- success:', data.success);
    console.log('- message:', data.message);
    console.log('- data keys:', data.data ? Object.keys(data.data) : 'no data');
    
    if (data.data && data.data.user) {
      console.log('- user keys:', Object.keys(data.data.user));
      console.log('- user full_name:', data.data.user.full_name);
      console.log('- user applicant_id:', data.data.user.applicant_id);
    }
    
    if (data.data && data.data.applications) {
      console.log('- applications keys:', Object.keys(data.data.applications));
    }
    
    if (data.data && data.data.stalls) {
      console.log('- stalls keys:', Object.keys(data.data.stalls));
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLogin();