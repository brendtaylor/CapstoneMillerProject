import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics to track failure rates
export let errorRate = new Rate('errors');

// Configuration: Simulated Load
export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp up to 10 users
    { duration: '1m', target: 50 },  // Stay at 50 users (Load)
    { duration: '30s', target: 0 },  // Ramp down
  ],
  thresholds: {
    errors: ['rate<0.01'], // Fail if error rate > 1%
    http_req_duration: ['p(95)<500'], // 95% of requests should be under 500ms
  },
};

// Base URL (assuming docker-compose exposes api on port 3000)
const BASE_URL = 'http://localhost:3000/api';

// Test Data from your seed files
const TEST_USERS = [1001, 1002, 1004, 1005];

export default function () {
  // 1. AUTHENTICATION (Using the Dev Route)
  // We pick a random user from your seed data to simulate real activity
  const userId = TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
  
  const loginPayload = JSON.stringify({ userId: userId });
  const loginParams = { headers: { 'Content-Type': 'application/json' } };
  
  const loginRes = http.post(`${BASE_URL}/dev/login`, loginPayload, loginParams);
  
  const isLoginSuccessful = check(loginRes, {
    'logged in successfully': (r) => r.status === 200,
    'has token': (r) => r.json('token') !== undefined,
  });

  if (!isLoginSuccessful) {
    errorRate.add(1);
    return;
  }

  const token = loginRes.json('token');
  const authHeaders = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  group('Ticket Workflows', () => {
    
    // 2. READ: Simulate Dashboard Loading (Real User Behavior)
    // First, fetch the summary list
    const summaryRes = http.get(`${BASE_URL}/work-orders-summary`, authHeaders);
    
    check(summaryRes, { 
      'dashboard summary status is 200': (r) => r.status === 200 
    });

    // If summary loaded, pick a random Work Order ID and fetch its tickets 
    // (Simulating a user expanding an accordion)
    if (summaryRes.status === 200 && summaryRes.json().length > 0) {
      const workOrders = summaryRes.json();
      const randomWO = workOrders[Math.floor(Math.random() * workOrders.length)];
      
      const woTicketsRes = http.get(`${BASE_URL}/work-orders/${randomWO.wo_id}/tickets`, authHeaders);
      
      check(woTicketsRes, { 
        'fetch WO tickets status is 200': (r) => r.status === 200 
      });
    }

    // 3. WRITE: Create a Ticket
    const ticketPayload = JSON.stringify({
      wo: 1,
      unit: 101,
      sequence: 101,
      division: 1,
      laborDepartment: 1,      // <--- ADD THIS (Required by DB)
      manNonCon: 1,
      drawingNum: "23456",     // Changed to string to match Entity definition
      description: "Load test generated ticket",
      initiator: userId,       // <--- ADD THIS (Required by DB, reuse the authenticated ID)
    });

    const createRes = http.post(`${BASE_URL}/tickets`, ticketPayload, authHeaders);
    
    check(createRes, { 
      'create ticket status is 201': (r) => r.status === 201,
    }) || errorRate.add(1);

    // Optional: Extract ID from created ticket to test updates
    if (createRes.status === 201) {
      const ticketId = createRes.json('ticketId');
      
      // 4. UPDATE: Change Status (Tests specific logic)
      const updatePayload = JSON.stringify({
        status: 2, // Closing the ticket
        correctiveAction: "Auto-closed by load test",
        estimatedLaborHours: 2.5,
        materialsUsed: "None"
      });
      
      const updateRes = http.patch(`${BASE_URL}/tickets/${ticketId}/status`, updatePayload, authHeaders);
      check(updateRes, { 'update ticket status is 200': (r) => r.status === 200 });
    }
  });

  // Short sleep to simulate user think time
  sleep(1);
}