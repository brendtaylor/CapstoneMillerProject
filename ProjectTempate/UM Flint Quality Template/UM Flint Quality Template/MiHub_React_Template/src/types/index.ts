// --- Basic Lookup Types ---
// These match the generic-controller entities

export interface Division {
  divisionId: number;
  divisionName: string;
}

export interface User {
  id: number;
  name: string;
}

export interface Status {
  statusId: number;
  statusDescription: string;
}

export interface LaborDepartment {
  departmentId: number;
  departmentName: string;
}

// --- WO-Dependent Lookup Types ---
// These are the options that will be filtered

export interface WorkOrder {
  woId: number;
  wo: string;
}

export interface Unit {
  unitId: number;
  unitName: string;
}

export interface Sequence {
  sequenceId: number;
  sequenceName: string;
}

export interface Nonconformance {
  nonconId: number;
  noncon: string;
}


// --- API Response Types ---

// Represents the data from GET /work-orders-summary
export interface WorkOrderSummary {
  wo_id: number;
  wo_number: string;
  open_ticket_count: number;
}

// Represents a full ticket object
export interface Ticket {
  ticketId: number;
  qualityTicketId: string;
  description: string;
  openDate: string;
  closeDate?: string | null;
  drawingNum?: string | null;
  
  // Relational objects
  status: Status;
  initiator: User;
  division: Division;
  wo: WorkOrder;
  laborDepartment: LaborDepartment;
  manNonCon: Nonconformance;
  sequence: Sequence;
  
  unit?: Unit | null;
  assignedTo?: User | null;

  // Closing fields
  estimatedLaborHours?: number | null;
  correctiveAction?: string | null;
  materialsUsed?: string |null;
}