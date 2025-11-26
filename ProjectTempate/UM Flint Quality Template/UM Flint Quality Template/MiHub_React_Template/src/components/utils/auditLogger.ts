

// After successful login
//const user = await loginUser(email, password); // returns user object from DB
//localStorage.setItem("userId", user.id.toString()); // e.g. 1001

// Temporary User for Testing
//localStorage.setItem("userId", "1001"); // NROACH from your seed data

// auditLogger.ts
export async function logAudit(action: string, ticketId: number) {
  try {
    const userId = parseInt(localStorage.getItem("userId") || "0", 10);
    const timestamp = new Date().toISOString();

    const auditData = { userId, ticketId, action, timestamp };

    const response = await fetch("http://localhost:3000/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(auditData),
    });


    if (!response.ok) {
      console.error("Audit log failed:", await response.text());
    } else {
      console.log(`Audit logged: ${action} (Ticket #${ticketId})`);
    }
  } catch (error) {
    console.error("Audit log error:", error);
  }
}
