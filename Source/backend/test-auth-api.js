// Test Authentication API
// Chạy: node test-auth-api.js

const API_URL = 'http://localhost:5000/api/auth';

// Test data
const adminUser = {
  email: 'admin@factory.com',
  password: 'admin123',
  name: 'Admin Nhà Máy',
  role: 'Admin'
};

const workerUser = {
  email: 'worker1@factory.com',
  password: 'worker123',
  name: 'Công Nhân A',
  role: 'Worker',
  devices: ['ESP32_001', 'ESP32_002']
};

let adminToken = '';
let workerToken = '';

// Helper function
async function makeRequest(endpoint, method = 'GET', body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error('❌ Request error:', error.message);
    return { status: 0, data: { error: error.message } };
  }
}

async function runTests() {
  console.log('🧪 BẮT ĐẦU TEST AUTHENTICATION API\n');

  // Test 1: Register Admin
  console.log('📝 Test 1: Đăng ký Admin');
  const registerAdmin = await makeRequest('/register', 'POST', adminUser);
  console.log(`Status: ${registerAdmin.status}`);
  console.log('Response:', JSON.stringify(registerAdmin.data, null, 2));
  if (registerAdmin.data.token) {
    adminToken = registerAdmin.data.token;
    console.log('✅ Admin token saved\n');
  } else {
    console.log('⚠️ Admin đã tồn tại hoặc lỗi\n');
  }

  // Test 2: Register Worker
  console.log('📝 Test 2: Đăng ký Worker');
  const registerWorker = await makeRequest('/register', 'POST', workerUser);
  console.log(`Status: ${registerWorker.status}`);
  console.log('Response:', JSON.stringify(registerWorker.data, null, 2));
  if (registerWorker.data.token) {
    workerToken = registerWorker.data.token;
    console.log('✅ Worker token saved\n');
  } else {
    console.log('⚠️ Worker đã tồn tại hoặc lỗi\n');
  }

  // Test 3: Login Admin
  console.log('🔐 Test 3: Đăng nhập Admin');
  const loginAdmin = await makeRequest('/login', 'POST', {
    email: adminUser.email,
    password: adminUser.password
  });
  console.log(`Status: ${loginAdmin.status}`);
  console.log('Response:', JSON.stringify(loginAdmin.data, null, 2));
  if (loginAdmin.data.token) {
    adminToken = loginAdmin.data.token;
    console.log('✅ Admin login successful\n');
  }

  // Test 4: Login Worker
  console.log('🔐 Test 4: Đăng nhập Worker');
  const loginWorker = await makeRequest('/login', 'POST', {
    email: workerUser.email,
    password: workerUser.password
  });
  console.log(`Status: ${loginWorker.status}`);
  console.log('Response:', JSON.stringify(loginWorker.data, null, 2));
  if (loginWorker.data.token) {
    workerToken = loginWorker.data.token;
    console.log('✅ Worker login successful\n');
  }

  // Test 5: Get Admin Profile
  console.log('👤 Test 5: Lấy thông tin Admin Profile');
  const adminProfile = await makeRequest('/profile', 'GET', null, adminToken);
  console.log(`Status: ${adminProfile.status}`);
  console.log('Response:', JSON.stringify(adminProfile.data, null, 2));
  console.log();

  // Test 6: Get Worker Profile
  console.log('👤 Test 6: Lấy thông tin Worker Profile');
  const workerProfile = await makeRequest('/profile', 'GET', null, workerToken);
  console.log(`Status: ${workerProfile.status}`);
  console.log('Response:', JSON.stringify(workerProfile.data, null, 2));
  console.log();

  // Test 7: Update Worker Profile
  console.log('✏️ Test 7: Cập nhật Worker Profile');
  const updateWorker = await makeRequest('/profile', 'PUT', {
    name: 'Công Nhân A - Updated',
    devices: ['ESP32_001', 'ESP32_003']
  }, workerToken);
  console.log(`Status: ${updateWorker.status}`);
  console.log('Response:', JSON.stringify(updateWorker.data, null, 2));
  console.log();

  // Test 8: Login với sai mật khẩu
  console.log('❌ Test 8: Login với sai mật khẩu');
  const loginFail = await makeRequest('/login', 'POST', {
    email: adminUser.email,
    password: 'wrongpassword'
  });
  console.log(`Status: ${loginFail.status}`);
  console.log('Response:', JSON.stringify(loginFail.data, null, 2));
  console.log();

  // Test 9: Access profile không có token
  console.log('🚫 Test 9: Access profile không có token');
  const noToken = await makeRequest('/profile', 'GET');
  console.log(`Status: ${noToken.status}`);
  console.log('Response:', JSON.stringify(noToken.data, null, 2));
  console.log();

  // Test 10: Logout
  console.log('👋 Test 10: Logout Admin');
  const logout = await makeRequest('/logout', 'POST', null, adminToken);
  console.log(`Status: ${logout.status}`);
  console.log('Response:', JSON.stringify(logout.data, null, 2));
  console.log();

  console.log('✅ ĐÃ HOÀN THÀNH TẤT CẢ TEST!');
  console.log('\n📊 KẾT QUẢ:');
  console.log(`Admin Token: ${adminToken.substring(0, 20)}...`);
  console.log(`Worker Token: ${workerToken.substring(0, 20)}...`);
}

// Chạy tests
runTests().catch(console.error);
