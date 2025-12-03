

// After successful login
//const user = await loginUser(email, password); // returns user object from DB
//localStorage.setItem("userId", user.id.toString()); // e.g. 1001

// Temporary User for Testing
//localStorage.setItem("userId", "1001"); // NROACH from your seed data

// auditLogger.ts
export async function logAudit(userId: number, action: string, ticketId: number, woId?: number) {
  const timestamp = new Date().toISOString();
  const auditData = { userId, ticketId, action, timestamp, woId }; // 👈 FIXED

  const response = await fetch("http://localhost:3000/api/audit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(auditData),
  });

  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

