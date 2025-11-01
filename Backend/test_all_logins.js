// Test login endpoints with PowerShell-compatible requests
import http from 'http';

const makeRequest = (options, postData = null) => {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        statusCode: res.statusCode,
                        data: jsonData
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        data: data
                    });
                }
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

async function testAllLoginEndpoints() {
    console.log('🧪 Testing All Login Endpoints\n');

    const baseOptions = {
        hostname: 'localhost',
        port: 3001,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Test 1: Admin Login
    console.log('1️⃣ Testing Admin Login...');
    try {
        const adminData = JSON.stringify({
            username: 'testadmin',
            password: 'test123'
        });

        const adminOptions = {
            ...baseOptions,
            path: '/api/auth/admin/login',
            headers: {
                ...baseOptions.headers,
                'Content-Length': Buffer.byteLength(adminData)
            }
        };

        const adminResponse = await makeRequest(adminOptions, adminData);
        console.log(`   Status: ${adminResponse.statusCode}`);
        if (adminResponse.statusCode === 200) {
            console.log('   ✅ Admin login successful');
            console.log(`   User: ${adminResponse.data.user?.fullName || 'Unknown'}`);
            console.log(`   Role: ${adminResponse.data.user?.role || 'Unknown'}`);
        } else {
            console.log('   ❌ Admin login failed');
            console.log(`   Error: ${adminResponse.data.message || adminResponse.data}`);
        }
    } catch (error) {
        console.log('   ❌ Admin login error:', error.message);
    }

    // Test 2: Branch Manager Login
    console.log('\n2️⃣ Testing Branch Manager Login...');
    try {
        const bmData = JSON.stringify({
            username: 'testmanager',
            password: 'test123'
        });

        const bmOptions = {
            ...baseOptions,
            path: '/api/auth/branch_manager/login',
            headers: {
                ...baseOptions.headers,
                'Content-Length': Buffer.byteLength(bmData)
            }
        };

        const bmResponse = await makeRequest(bmOptions, bmData);
        console.log(`   Status: ${bmResponse.statusCode}`);
        if (bmResponse.statusCode === 200) {
            console.log('   ✅ Branch Manager login successful');
            console.log(`   User: ${bmResponse.data.user?.fullName || 'Unknown'}`);
            console.log(`   Role: ${bmResponse.data.user?.role || 'Unknown'}`);
            console.log(`   Branch: ${bmResponse.data.user?.branch?.name || 'Unknown'}`);
        } else {
            console.log('   ❌ Branch Manager login failed');
            console.log(`   Error: ${bmResponse.data.message || bmResponse.data}`);
        }
    } catch (error) {
        console.log('   ❌ Branch Manager login error:', error.message);
    }

    // Test 3: Employee Login
    console.log('\n3️⃣ Testing Employee Login...');
    try {
        const empData = JSON.stringify({
            username: 'testemployee',
            password: 'test123'
        });

        const empOptions = {
            ...baseOptions,
            path: '/api/employees/login',
            headers: {
                ...baseOptions.headers,
                'Content-Length': Buffer.byteLength(empData)
            }
        };

        const empResponse = await makeRequest(empOptions, empData);
        console.log(`   Status: ${empResponse.statusCode}`);
        if (empResponse.statusCode === 200) {
            console.log('   ✅ Employee login successful');
            console.log(`   User: ${empResponse.data.user?.fullName || 'Unknown'}`);
            console.log(`   Role: ${empResponse.data.user?.role || 'Unknown'}`);
            console.log(`   Branch: ${empResponse.data.user?.branch?.name || 'Unknown'}`);
        } else {
            console.log('   ❌ Employee login failed');
            console.log(`   Error: ${empResponse.data.message || empResponse.data}`);
        }
    } catch (error) {
        console.log('   ❌ Employee login error:', error.message);
    }

    console.log('\n🏁 All tests completed.');
}

testAllLoginEndpoints().catch(console.error);