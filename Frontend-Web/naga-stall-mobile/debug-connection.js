// Quick connection test for debugging
// Run this in your Expo console to test connectivity

import { API_CONFIG } from './config/networkConfig';

// Test basic connectivity
export const testConnection = async () => {
  console.log('🔌 Testing connection to:', API_CONFIG.BASE_URL);
  
  try {
    // Test 1: Basic server response
    const response = await fetch(`${API_CONFIG.BASE_URL}/`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      timeout: 5000
    });
    
    console.log('📡 Server response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Server is reachable:', data.message);
    }
    
    // Test 2: Health endpoint
    const healthResponse = await fetch(`${API_CONFIG.BASE_URL}/api/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      timeout: 5000
    });
    
    console.log('🏥 Health endpoint status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check passed:', healthData.message);
    }
    
    // Test 3: Mobile login endpoint structure
    console.log('🔗 Testing mobile login URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.MOBILE_ENDPOINTS.LOGIN}`);
    
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
};

// Instructions for manual testing
console.log(`
🔧 MANUAL TESTING INSTRUCTIONS:

1. Open your computer browser and test these URLs:
   - ${API_CONFIG.BASE_URL}/
   - ${API_CONFIG.BASE_URL}/api/health
   - ${API_CONFIG.BASE_URL}/api/mobile/mobile-login (will show error but should be reachable)

2. Make sure your backend terminal shows:
   🌐 Server running on http://localhost:3001
   📱 Mobile access: http://192.168.8.38:3001

3. Check Windows Firewall:
   - Windows Security > Firewall & network protection
   - Allow Node.js through firewall

4. Verify IP address:
   - Open Command Prompt
   - Type: ipconfig
   - Look for IPv4 Address under Wi-Fi adapter
   - Update IP in networkConfig.js if different

5. Try login in app and check Expo console for detailed logs
`);