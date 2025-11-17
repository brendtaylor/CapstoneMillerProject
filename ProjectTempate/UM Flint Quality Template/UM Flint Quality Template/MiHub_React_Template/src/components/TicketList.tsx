import React from "react";
import { Ticket } from "../types"; // Import your Ticket type
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion"; // Assuming you still want the inner accordion for tickets

// 1. Update the props to accept a list of tickets
interface TicketListProps {
  tickets: Ticket[];
}

// 2. Remove all internal useEffect, useState, and api calls for fetching
export const TicketList: React.FC<TicketListProps> = ({ tickets }) => {

  if (!tickets || tickets.length === 0) {
    return <p className="text-center text-gray-500">No tickets found for this Work Order.</p>;
  }

  // 3. The component now just renders the prop it was given
  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible>
        {tickets.map((ticket) => (
          <AccordionItem key={ticket.ticketId} value={ticket.ticketId.toString()}>
            <AccordionTrigger>
              <div className="flex justify-between w-full pr-4">
                <span>{ticket.qualityTicketId}</span> {/* Use new Quality ID */}
                <span>{ticket.status.statusDescription}</span>
                <span>{ticket.initiator.name}</span>
                <span>{new Date(ticket.openDate).toLocaleDateString()}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p><strong>Description:</strong> {ticket.description}</p>
              {/* Add all other ticket details here */}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default TicketList;