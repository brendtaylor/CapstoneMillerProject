import React from "react";
import { Ticket } from "../types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

interface TicketListProps {
  tickets: Ticket[];
}

// Helper component for consistent data rows
const DetailRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-100 pb-1 mb-1 last:border-0">
    <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">{label}</span>
    <span className="font-medium text-gray-900 text-sm text-right">{value || "-"}</span>
  </div>
);

export const TicketList: React.FC<TicketListProps> = ({ tickets }) => {
  if (!tickets || tickets.length === 0) {
    return <div className="text-center p-8 text-gray-500 bg-white rounded shadow-sm">No tickets found.</div>;
  }

  // 1. Group tickets by Work Order Number
  const ticketsByWO = tickets.reduce((acc, ticket) => {
    const woNum = ticket.wo.wo;
    if (!acc[woNum]) {
      acc[woNum] = [];
    }
    acc[woNum].push(ticket);
    return acc;
  }, {} as Record<string, Ticket[]>);

  // Sort Work Orders
  const sortedWOs = Object.keys(ticketsByWO).sort();

  return (
    <div className="space-y-4">
      {/* --- OUTER ACCORDION: WORK ORDERS --- */}
      <Accordion type="multiple" className="w-full space-y-2">
        {sortedWOs.map((woNum) => (
          <AccordionItem 
            key={woNum} 
            value={woNum} 
            className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden"
          >
            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 hover:no-underline transition-colors">
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-gray-800">Work Order: {woNum}</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {ticketsByWO[woNum].length} Ticket{ticketsByWO[woNum].length !== 1 && 's'}
                </span>
              </div>
            </AccordionTrigger>
            
            <AccordionContent className="px-6 pb-6 pt-2 bg-gray-50/50">
              
              {/* --- INNER ACCORDION: TICKETS --- */}
              <Accordion type="single" collapsible className="w-full space-y-2">
                {ticketsByWO[woNum].map((ticket) => {
                    // Determine badge style based on status
                    const badgeStyle = ticket.status.statusId === 0 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800";

                    return (
                      <AccordionItem 
                        key={ticket.ticketId} 
                        value={ticket.ticketId.toString()}
                        className="border border-gray-200 bg-white rounded-md"
                      >
                        <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 hover:no-underline">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full text-left pr-4 items-center">
                            <span className="font-bold text-blue-600">{ticket.qualityTicketId}</span>
                            
                            {/* Status Badge */}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${badgeStyle}`}>
                              {ticket.status.statusDescription}
                            </span>

                            <span className="text-sm text-gray-600 truncate">
                                <span className="text-gray-400 mr-1">By:</span>
                                {ticket.initiator.name}
                            </span>
                            
                            <span className="text-sm text-gray-500 text-right md:text-left">
                                {new Date(ticket.openDate).toLocaleDateString()}
                            </span>
                          </div>
                        </AccordionTrigger>
                        
                        <AccordionContent className="px-4 py-4 border-t border-gray-100">
                          {/* --- FULL TICKET DETAILS --- */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* Section 1: Description */}
                            <div className="lg:col-span-3 space-y-2">
                              <h4 className="text-sm font-bold text-gray-900">Description</h4>
                              <div className="p-3 bg-gray-50 rounded border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap">
                                {ticket.description || "No description provided."}
                              </div>
                            </div>

                            {/* Section 2: Context */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-bold text-gray-900 border-b pb-1">Context</h4>
                              <DetailRow label="Division" value={ticket.division.divisionName} />
                              <DetailRow label="Labor Dept" value={ticket.laborDepartment.departmentName} />
                              <DetailRow label="Sequence" value={ticket.sequence ? ticket.sequence.sequenceName : 'N/A'} />
                              <DetailRow label="Unit" value={ticket.unit?.unitName} />
                            </div>

                            {/* Section 3: Classification */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-bold text-gray-900 border-b pb-1">Classification</h4>
                              <DetailRow label="Non-Conformance" value={ticket.manNonCon.noncon} />
                              <DetailRow label="Drawing #" value={ticket.drawingNum} />
                              <DetailRow label="Assigned To" value={ticket.assignedTo?.name || "Unassigned"} />
                            </div>

                            {/* Section 4: Closing Info (Only if closed) */}
                            {ticket.status.statusId === 1 && (
                              <div className="space-y-3 bg-red-50 p-3 rounded border border-red-100">
                                <h4 className="text-sm font-bold text-red-900 border-b border-red-200 pb-1">Resolution</h4>
                                <DetailRow label="Closed Date" value={ticket.closeDate ? new Date(ticket.closeDate).toLocaleDateString() : 'N/A'} />
                                <DetailRow label="Est. Hours Lost" value={ticket.estimatedLaborHours?.toString()} />
                                <DetailRow label="Materials" value={ticket.materialsUsed} />
                                
                                <div className="pt-2 border-t border-red-200 mt-2">
                                  <span className="text-red-900 text-xs uppercase tracking-wider font-semibold block mb-1">Corrective Action</span>
                                  <p className="text-sm text-gray-800">{ticket.correctiveAction || "N/A"}</p>
                                </div>
                              </div>
                            )}

                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                })}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default TicketList;