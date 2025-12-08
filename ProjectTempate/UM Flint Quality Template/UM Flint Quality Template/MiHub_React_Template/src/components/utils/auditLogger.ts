import { api } from "../../api";

export async function logAudit(userId: number, action: string, ticketId: number, woId?: number) {
  const timestamp = new Date().toISOString();
  const auditData = { userId, ticketId, action, timestamp, woId };
  const response = await api.post("/audit", auditData);
  return response.data;
}