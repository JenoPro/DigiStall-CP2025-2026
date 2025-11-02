// Simple connectivity and login test
// Run this to debug mobile app connectivity issues

import { API_CONFIG, NetworkUtils } from './config/networkConfig';
import ApiService from './services/ApiService';

async function debugConnectivity() {
  console.log('🔍 Starting connectivity debug...');
  console.log('📍 Current server configuration:', API_CONFIG.SERVERS);
  
  try {
    // Test 1: Basic connectivity
    console.log('\n🔌 Test 1: Basic Connectivity');
    const server = await NetworkUtils.getActiveServer();
    console.log('✅ Found working server:', server);
    
    // Test 2: Health check
    console.log('\n📋 Test 2: Health Check');
    const healthResponse = await fetch(`${server}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check response:', healthData);
    
    // Test 3: Mobile login endpoint
    console.log('\n🔐 Test 3: Mobile Login Test');
    const loginResponse = await ApiService.mobileLogin('25-93276', 'password123');
    console.log('✅ Login response:', loginResponse);
    
    console.log('\n✅ All tests passed! Mobile app should work.');
    
  } catch (error) {
    console.error('\n❌ Debug test failed:', error);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check backend server is running: http://192.168.1.101:3001/api/health');
    console.log('2. Verify IP address is correct in networkConfig.js');
    console.log('3. Check firewall settings');
    console.log('4. Ensure same network for mobile device and backend');
  }
}

// Export for use in React Native
export default debugConnectivity;

// Test configuration
console.log('🔧 Debug Configuration:');
console.log('Current IP in config:', API_CONFIG.SERVERS[0]);
console.log('Login endpoint:', API_CONFIG.MOBILE_ENDPOINTS.LOGIN);
console.log('Expected full URL:', `${API_CONFIG.SERVERS[0]}${API_CONFIG.MOBILE_ENDPOINTS.LOGIN}`);