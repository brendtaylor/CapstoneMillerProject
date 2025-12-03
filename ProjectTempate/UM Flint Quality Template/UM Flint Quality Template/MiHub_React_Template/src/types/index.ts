// --- Basic Lookup Types ---
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
export interface WorkOrder {
  woId: number;
  wo: string;
}

export interface Unit {
  unitId: number;
  unitName: string;
}

export interface Sequence {
  seqID: number;
  seqName: string;
}

export interface Nonconformance {
  nonConId: number;
  nonCon: string;
}

// --- API Response Types ---

// Represents the data from GET /work-orders-summary
export interface WorkOrderSummary {
  wo_id: number;
  wo_number: string;
  open_ticket_count: number;
}

// 1. Define TicketClosure separate from Ticket
export interface TicketClosure {
  id: number;
  cycleStartDate?: string | null;
  cycleCloseDate: string;
  correctiveAction?: string | null;
  materialsUsed?: string | null;
  estimatedLaborHours?: number | null;
  closedBy?: User | null;
}

// 2. Represents a full ticket object
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

  // Closing fields (Legacy/Current Cycle)
  estimatedLaborHours?: number | null;
  correctiveAction?: string | null;
  materialsUsed?: string |null;
  
  // 3. Add the closures array here
  closures?: TicketClosure[];
}