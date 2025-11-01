// Simple test without axios
import http from 'http';

const makeRequest = (options, postData = null) => {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    data: data
                });
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (postData) {
            req.write(postData);
        }
        req.end();
    });
};

async function testEndpoints() {
    console.log('🔧 Testing Login Endpoints...\n');

    // Test Health Check
    console.log('🏥 Testing Health Check...');
    try {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/health',
            method: 'GET'
        });
        console.log('✅ Health Check:', response.statusCode, response.data);
    } catch (error) {
        console.log('❌ Health Check Error:', error.message);
    }

    // Test Admin Login
    console.log('\n1️⃣ Testing Admin Login...');
    try {
        const postData = JSON.stringify({
            username: 'admin',
            password: 'test123'
        });

        const response = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/admin/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        }, postData);

        console.log('Response Status:', response.statusCode);
        console.log('Response Data:', response.data);
    } catch (error) {
        console.log('❌ Admin Login Error:', error.message);
    }

    console.log('\n🏁 Test completed.');
}

testEndpoints().catch(console.error);