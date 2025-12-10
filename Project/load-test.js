import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate } from 'k6/metrics';

export let errorRate = new Rate('errors');

// CONFIGURATION: Standard Load Test
// Target: 100 Concurrent Users (Peak)
export const options = {
  stages: [
    { duration: '30s', target: 25 },  // Warm up to 50%
    { duration: '1m', target: 50 },  // Ramp to Peak
    { duration: '5m', target: 50 },  // Steady State (Soak)
    { duration: '30s', target: 0 },   // Cool down
  ],
  thresholds: {
    // 95% of requests must finish within 1 second
    http_req_duration: ['p(95)<1000'], 
    // Error rate must be less than 1%
    errors: ['rate<0.01'],             
  },
};

const BASE_URL = 'http://localhost:3000/api';

// VALID USERS
// We exclude User 1003 because they are Role 1 (Viewer) and cannot Update/Close tickets.
// IDs: 1001 (Role 3), 1002 (Role 2), 1004 (Role 2), 1005 (Role 2)
const TEST_USERS = [1001, 1002, 1004, 1005];

// DATA MAP: Strictly enforces valid foreign key combinations defined in init.sql
const WORK_ORDER_DATA = {
  1: {
    // WO 1: 24113
    units: [101, 102],           // A1, A2
    sequences: [101, 103],       // REW-00300, DSA-20019
    departments: [1, 2, 4, 7, 8] // Assembly, Contractor Issue, FAB, Paint, Other
  },
  2: {
    // WO 2: 023186
    units: [106, 107],           // B1, B2
    sequences: [102, 104],       // 000400, 019000
    departments: [3, 5, 8]       // Electrical, Laser, Other
  },
  3: {
    // WO 3: 341118
    units: [103, 108],           // A3, B3
    sequences: [105, 106],       // LMN-12345, ABC-67890
    departments: [1, 4, 7, 8]    // Welding(1 in map?), FAB, Paint, Other
  },
  4: {
    // WO 4: 253233
    units: [104, 109],           // A4, B4
    sequences: [101, 104],       // REW-00300, 019000
    departments: [2, 3, 6, 8]    // Assembly, Paint(3 in map?), Processing, Other
  },
  5: {
    // WO 5: 289933
    units: [105, 110],           // A5, B5
    sequences: [102, 103],       // 000400, DSA-20019
    departments: [5, 6, 7, 8]    // Detailing, Processing, Paint, Other
  }
};

// Global Arrays for valid generic IDs
const DIVISIONS = [1, 2, 3]; // FlexAir, PFab, CInstall
const NON_CONFORMANCES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export default function () {
  // 1. LOGIN
  const userId = TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
  const loginRes = http.post(`${BASE_URL}/dev/login`, JSON.stringify({ userId: userId }), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (check(loginRes, { 'login success': (r) => r.status === 200 })) {
    const token = loginRes.json('token');
    const authHeaders = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    group('Ticket Workflows', () => {
      // 2. READ: Dashboard Summary (Simulating Landing Page)
      const summaryRes = http.get(`${BASE_URL}/work-orders-summary`, authHeaders);
      check(summaryRes, { 'dashboard loaded': (r) => r.status === 200 });

      // 3. READ: Specific Work Order (Simulating Drill Down)
      // We pick a valid WO ID (1-5) from our map keys
      const woKeys = Object.keys(WORK_ORDER_DATA);
      const randomWoId = woKeys[Math.floor(Math.random() * woKeys.length)];
      
      const drillDownRes = http.get(`${BASE_URL}/work-orders/${randomWoId}/tickets`, authHeaders);
      check(drillDownRes, { 'wo tickets loaded': (r) => r.status === 200 });

      // 4. WRITE: Create a Valid Ticket
      // Use the map to ensure Foreign Key Integrity
      const validData = WORK_ORDER_DATA[randomWoId];
      
      const ticketPayload = JSON.stringify({
        wo: parseInt(randomWoId),
        unit: validData.units[Math.floor(Math.random() * validData.units.length)],
        sequence: validData.sequences[Math.floor(Math.random() * validData.sequences.length)],
        laborDepartment: validData.departments[Math.floor(Math.random() * validData.departments.length)],
        division: DIVISIONS[Math.floor(Math.random() * DIVISIONS.length)],
        manNonCon: NON_CONFORMANCES[Math.floor(Math.random() * NON_CONFORMANCES.length)],
        drawingNum: "LOAD-TEST",
        description: `Load test ticket for WO #${randomWoId}`,
        initiator: userId,
      });

      const createRes = http.post(`${BASE_URL}/tickets`, ticketPayload, authHeaders);
      
      // 5. UPDATE: Close Ticket (To test DB locking/concurrency)
      // Only runs if creation was successful
      if (check(createRes, { 'created': (r) => r.status === 201 })) {
        const ticketId = createRes.json('ticketId');
        
        const updatePayload = JSON.stringify({
          status: 2, // Close it
          correctiveAction: "Auto-closed by load test",
          estimatedLaborHours: 0.5,
          materialsUsed: "None"
        });
        
        const updateRes = http.patch(`${BASE_URL}/tickets/${ticketId}/status`, updatePayload, authHeaders);
        check(updateRes, { 'updated': (r) => r.status === 200 });
      } else {
        errorRate.add(1); // Track failed creations
      }
    });
  } else {
    errorRate.add(1); // Track failed logins
  }

  // Simulate human think time
  sleep(1);
}