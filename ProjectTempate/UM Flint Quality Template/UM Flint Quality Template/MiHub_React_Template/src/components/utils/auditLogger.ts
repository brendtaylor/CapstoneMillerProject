export async function logAudit(userId: number, action: string, ticketId: number, woId?: number) {
  const timestamp = new Date().toISOString();
  const auditData = { userId, ticketId, action, timestamp, woId };

  // 1. Get Token
  const token = localStorage.getItem('token');

  const response = await fetch("http://localhost:3000/api/audit", {
    method: "POST",
    headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
    },
    body: JSON.stringify(auditData),
  });

  if (!response.ok) throw new Error(await response.text());
  return response.json();
}