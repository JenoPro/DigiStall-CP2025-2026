// Test script to verify all login endpoints
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

async function testLoginEndpoints() {
    console.log('🔧 Testing Login Endpoints...\n');

    // Test 1: Admin Login
    console.log('1️⃣ Testing Admin Login...');
    try {
        const adminResponse = await axios.post(`${API_BASE_URL}/api/auth/admin/login`, {
            username: 'admin',
            password: 'test123'
        });
        console.log('✅ Admin Login Response:', adminResponse.data);
    } catch (error) {
        console.log('❌ Admin Login Error:', error.response?.data || error.message);
    }

    // Test 2: Branch Manager Login
    console.log('\n2️⃣ Testing Branch Manager Login...');
    try {
        const bmResponse = await axios.post(`${API_BASE_URL}/api/auth/branch_manager/login`, {
            username: 'manager01',
            password: 'test123'
        });
        console.log('✅ Branch Manager Login Response:', bmResponse.data);
    } catch (error) {
        console.log('❌ Branch Manager Login Error:', error.response?.data || error.message);
    }

    // Test 3: Employee Login
    console.log('\n3️⃣ Testing Employee Login...');
    try {
        const empResponse = await axios.post(`${API_BASE_URL}/api/employees/login`, {
            username: 'EMP1001',
            password: 'test123'
        });
        console.log('✅ Employee Login Response:', empResponse.data);
    } catch (error) {
        console.log('❌ Employee Login Error:', error.response?.data || error.message);
    }

    // Test 4: Check all available routes
    console.log('\n4️⃣ Testing Health Check...');
    try {
        const healthResponse = await axios.get(`${API_BASE_URL}/api/health`);
        console.log('✅ Health Check Response:', healthResponse.data);
    } catch (error) {
        console.log('❌ Health Check Error:', error.response?.data || error.message);
    }

    console.log('\n🏁 Test completed.');
}

testLoginEndpoints().catch(console.error);