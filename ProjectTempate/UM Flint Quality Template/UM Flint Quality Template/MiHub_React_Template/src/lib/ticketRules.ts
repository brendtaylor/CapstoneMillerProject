import { Ticket } from "../types/ticket";

export function isEditable(ticket: Ticket): boolean {
  return ticket.status ==="Open" || ticket.status === "In Progress";
}

export function canChangeStatus(ticket: Ticket, nextStatus: string): boolean {
  const allowedTransitions: Record<string, sting[]> = {
    "Open": ["In Progress", "Close"],
    "In Progess": ["Closed"],
    "Closed": [],
    "Archived":[]
};

return allowedTransitions[ticket.status]?.includes(nextStatus) || false;
}

export fuction validateWorkOrder(wo: string): boolean {
  return /^\d{5}$/.test(wo);
}

export function requiresAssignedUser(ticket: Ticket): boolean {
  return ticket.status === "In Progress" && !ticket.assignedTo;
} 
