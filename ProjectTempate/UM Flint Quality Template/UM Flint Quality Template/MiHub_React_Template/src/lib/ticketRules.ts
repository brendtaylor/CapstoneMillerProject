import { Ticket } from "../types/ticket";

export function getStatus(ticket: Ticket): string {
  // Normalize your status format for easier comparisons
  return ticket.status?.statusDescription || "";
}

export function isEditable(ticket: Ticket): boolean {
  const status = getStatus(ticket);
  return status === "Open" || status === "In Progress";
}

export function canChangeStatus(ticket: Ticket, nextStatus: string): boolean {
  const status = getStatus(ticket);

  const allowedTransitions: Record<string, string[]> = {
    "Open": ["In Progress", "Closed"],
    "In Progress": ["Closed"],
    "Closed": [],
    "Archived": []
  };

  return allowedTransitions[status]?.includes(nextStatus) || false;
}

export function validateWorkOrder(wo: string): boolean {
  return /^\d{5}$/.test(wo);
}

export function requiresAssignedUser(ticket: Ticket): boolean {
  const status = getStatus(ticket);
  return status === "In Progress" && !ticket["assignedTo"];
}
