import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate } from 'k6/metrics';

export let errorRate = new Rate('errors');

// Staircase stress test to find the breaking point around 100-150 users
export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Normal Load
    { duration: '2m', target: 100 }, // Soak
    { duration: '2m', target: 120 }, // Buffer Zone
    { duration: '2m', target: 150 }, // Stress Zone
    { duration: '1m', target: 0 },   // Cooldown
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // Latency target < 1s
    errors: ['rate<0.01'],             // Error rate < 1%
  },
};

const BASE_URL = 'http://localhost:3000/api';

// VALID USERS from init.sql (Excluding 1003 who is Role 1/Viewer)
const TEST_USERS = [1001, 1002, 1004, 1005];

export default function () {
  // 1. LOGIN
  const userId = TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
  
  const loginPayload = JSON.stringify({ userId: userId });
  const loginParams = { headers: { 'Content-Type': 'application/json' } };
  
  const loginRes = http.post(`${BASE_URL}/dev/login`, loginPayload, loginParams);
  
  if (check(loginRes, { 'login success': (r) => r.status === 200 })) {
    const token = loginRes.json('token');
    const authHeaders = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    group('Ticket Workflows', () => {
      // 2. READ: Dashboard Summary
      const summaryRes = http.get(`${BASE_URL}/work-orders-summary`, authHeaders);
      check(summaryRes, { 'dashboard loaded': (r) => r.status === 200 });

      // 3. READ: Drill down into a random Work Order
      // init.sql creates WOs 1 through 5
      const readWoId = Math.floor(Math.random() * 5) + 1;
      const drillDownRes = http.get(`${BASE_URL}/work-orders/${readWoId}/tickets`, authHeaders);
      check(drillDownRes, { 'work order tickets loaded': (r) => r.status === 200 });

      // 4. WRITE: Create Ticket
      // Using ranges defined in init.sql
      const woId = Math.floor(Math.random() * 5) + 1;       // IDs 1-5
      const unitId = Math.floor(Math.random() * 10) + 101;  // IDs 101-110
      const seqId = Math.floor(Math.random() * 6) + 101;    // IDs 101-106
      const deptId = Math.floor(Math.random() * 5) + 1;     // IDs 1-5
      
      const ticketPayload = JSON.stringify({
        wo: woId,
        unit: unitId,
        sequence: seqId,
        division: 1,       // FlexAir
        laborDepartment: deptId, 
        manNonCon: 1,      // Material
        drawingNum: "LOAD-TEST",
        description: `Stress test ticket for WO #${woId}`,
        initiator: userId,
      });

      const createRes = http.post(`${BASE_URL}/tickets`, ticketPayload, authHeaders);
      
      // 5. UPDATE: Close the Ticket
      if (check(createRes, { 'created': (r) => r.status === 201 })) {
        const ticketId = createRes.json('ticketId');
        
        const updatePayload = JSON.stringify({
          status: 2, // Closed
          correctiveAction: "Auto-closed by k6 stress test",
          estimatedLaborHours: 0.5,
          materialsUsed: "None"
        });
        
        const updateRes = http.patch(`${BASE_URL}/tickets/${ticketId}/status`, updatePayload, authHeaders);
        check(updateRes, { 'updated': (r) => r.status === 200 });
      } else {
        errorRate.add(1);
      }
    });
  }
  
  sleep(1);
}