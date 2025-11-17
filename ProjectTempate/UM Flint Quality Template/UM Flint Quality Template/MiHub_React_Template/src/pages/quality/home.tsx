import React, { useState, useEffect } from "react";
import { api } from "../../api"; // Assuming you have a central 'api' client
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { TicketList } from "../../components/TicketList";
import { Skeleton } from "../../components/ui/skeleton";
import { WorkOrderSummary, Ticket } from "../../types"; // Import your new types

export const Home = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrderSummary[]>([]);
  const [fetchedTickets, setFetchedTickets] = useState<Record<number, Ticket[]>>({});
  const [loadingWOs, setLoadingWOs] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // 1. Fetch the Work Order summary list on initial component mount
  useEffect(() => {
    const fetchWorkOrderSummary = async () => {
      try {
        setLoadingWOs(true);
        const response = await api.get("/work-orders-summary");
        setWorkOrders(response.data);
      } catch (error) {
        console.error("Error fetching work order summary:", error);
      } finally {
        setLoadingWOs(false);
      }
    };
    fetchWorkOrderSummary();
  }, []);

  // 2. Handle accordion clicks to "lazy load" tickets
  const handleAccordionChange = async (woId: string) => {
    if (!woId) return; // Accordion is collapsing

    const workOrderId = parseInt(woId);

    // Check if we've already fetched these tickets
    if (!fetchedTickets[workOrderId]) {
      try {
        setLoadingTickets(true);
        const response = await api.get(`/work-orders/${workOrderId}/tickets`);
        
        // Store these tickets in our state, keyed by their WO ID
        setFetchedTickets(prev => ({
          ...prev,
          [workOrderId]: response.data,
        }));
      } catch (error) {
        console.error(`Error fetching tickets for WO ${workOrderId}:`, error);
      } finally {
        setLoadingTickets(false);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Quality Tickets</h1>
      
      {loadingWOs ? (
        <WorkOrderSkeleton />
      ) : (
        <Accordion type="single" collapsible onValueChange={handleAccordionChange}>
          {workOrders.map((wo) => (
            <AccordionItem key={wo.wo_id} value={wo.wo_id.toString()}>
              <AccordionTrigger>
                <div className="flex justify-between w-full pr-4">
                  <span className="font-bold text-lg">WO: {wo.wo_number}</span>
                  <span className="text-gray-500">
                    {wo.open_ticket_count} Open Tickets
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {/* Check if tickets for this WO are fetched.
                  If they are, render TicketList.
                  If not, show a loading state.
                */}
                {fetchedTickets[wo.wo_id] ? (
                  <TicketList tickets={fetchedTickets[wo.wo_id]} />
                ) : (
                  <p>Loading tickets...</p>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};

// A helper component for the initial loading state
const WorkOrderSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
);

export default Home;