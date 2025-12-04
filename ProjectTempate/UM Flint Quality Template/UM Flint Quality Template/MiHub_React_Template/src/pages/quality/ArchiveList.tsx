import React, { useState, useEffect } from "react";
import ScaleLoader from "react-spinners/ScaleLoader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "../../hooks/use-debounce";
import { Ticket, WorkOrderSummary } from "../../types";

// Helper for display rows
const DetailRow = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-100 pb-1 mb-1 last:border-0">
    <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">{label}</span>
    <span className="font-medium text-gray-900 text-sm text-right">{value || "-"}</span>
  </div>
);

const getStatusBadgeStyle = (statusId?: number): string => {
  switch (statusId) {
    case 0: return "bg-red-100 text-red-800"; 
    case 1: return "bg-yellow-100 text-yellow-800"; 
    case 2: return "bg-green-100 text-green-800"; 
    default: return "bg-gray-100 text-gray-800";
  }
};

const ArchiveList: React.FC = () => {
  const navigate = useNavigate();
  
  // Data State
  const [summaries, setSummaries] = useState<WorkOrderSummary[]>([]);
  const [searchResults, setSearchResults] = useState<WorkOrderSummary[] | null>(null);
  const [ticketsCache, setTicketsCache] = useState<Record<number, Ticket[]>>({});
  const [loadingWOs, setLoadingWOs] = useState<Record<number, boolean>>({});
  const [loadingSummaries, setLoadingSummaries] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // UI State
  const [openWorkOrders, setOpenWorkOrders] = useState<string[]>([]);
  const [openTickets, setOpenTickets] = useState<Record<string, string>>({});

  // Fetch Archived Work Order Summaries
  useEffect(() => {
    const fetchSummaries = async () => {
      setLoadingSummaries(true);
      try {
        const url = debouncedSearchTerm 
          ? `http://localhost:3000/api/work-orders/archived-summary?search=${debouncedSearchTerm}`
          : `http://localhost:3000/api/work-orders/archived-summary`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch archive summary");
        
        const data: WorkOrderSummary[] = await response.json();
        
        if (debouncedSearchTerm) {
            setSearchResults(data);
        } else {
            setSummaries(data);
            setSearchResults(null);
        }
      } catch (err) {
        setError("Failed to load archived work orders.");
        console.error(err);
      } finally {
        setLoadingSummaries(false);
      }
    };

    fetchSummaries();
  }, [debouncedSearchTerm]);

  // Lazy Load Archived Tickets for a WO
  const fetchTicketsForWO = async (woId: number) => {
    if (ticketsCache[woId]) return;

    setLoadingWOs(prev => ({ ...prev, [woId]: true }));
    try {
        const response = await fetch(`http://localhost:3000/api/work-orders/${woId}/archived-tickets`);
        if (!response.ok) throw new Error("Failed to fetch tickets");
        const data: Ticket[] = await response.json();
        setTicketsCache(prev => ({ ...prev, [woId]: data }));
    } catch (err) {
        console.error(err);
    } finally {
        setLoadingWOs(prev => ({ ...prev, [woId]: false }));
    }
  };

  const displayedData = searchResults ?? summaries;

  if (loadingSummaries && !searchResults) return <div className="flex justify-center p-8"><ScaleLoader color="#3b82f6" /></div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="p-4 md:p-6 max-w-[1300px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Archived Tickets</h1>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search Archive by Work Order..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm bg-white"
        />
      </div>

      {/* Ticket List */}
      <div className="space-y-4">
        {displayedData.length === 0 ? (
          <div className="text-center p-8 text-gray-500 bg-white rounded shadow-sm">
            {searchTerm ? 'No archived work orders match your search.' : 'No archived tickets found.'}
          </div>
        ) : (
          <Accordion 
            type="multiple" 
            className="w-full space-y-2"
            value={openWorkOrders}
            onValueChange={setOpenWorkOrders}
          >
            {displayedData.map((wo) => (
              <AccordionItem 
                key={wo.wo_id} 
                value={wo.wo_number} 
                className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden"
              >
                <AccordionTrigger 
                    onClick={() => fetchTicketsForWO(wo.wo_id)}
                    className="px-6 py-4 hover:bg-gray-50 hover:no-underline"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-gray-800">{wo.wo_number}</span>
                    <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {wo.open_ticket_count} Archived
                    </span>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="px-6 pb-6 pt-2 bg-gray-50/50">
                   {loadingWOs[wo.wo_id] ? (
                        <div className="flex justify-center p-4"><ScaleLoader height={15} color="#3b82f6" /></div>
                    ) : !ticketsCache[wo.wo_id] || ticketsCache[wo.wo_id].length === 0 ? (
                         <div className="text-center text-gray-500 italic p-2">No tickets found.</div>
                    ) : (
                  <Accordion 
                    type="single" 
                    collapsible 
                    className="w-full space-y-2"
                    value={openTickets[wo.wo_number] || ''}
                    onValueChange={(val) => setOpenTickets(prev => ({...prev, [wo.wo_number]: val}))}
                  >
                    {ticketsCache[wo.wo_id]?.map((ticket) => (
                      <AccordionItem 
                        key={ticket.ticketId} 
                        value={ticket.ticketId.toString()}
                        className="border border-gray-200 bg-white rounded-md"
                      >
                        <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 hover:no-underline">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full text-left pr-4 items-center">
                            <span className="font-bold text-blue-600">{ticket.qualityTicketId || ticket.ticketId}</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${getStatusBadgeStyle(ticket.status?.statusId)}`}>
                              {ticket.status?.statusDescription}
                            </span>
                            <span className="text-sm text-gray-600 truncate">
                                <span className="text-gray-400 mr-1">By:</span>
                                {ticket.initiator?.name}
                            </span>
                            <span className="text-sm text-gray-500 text-right md:text-left">
                                {new Date(ticket.openDate).toLocaleDateString()}
                            </span>
                          </div>
                        </AccordionTrigger>
                        
                        <AccordionContent className="px-4 py-4 border-t border-gray-100">
                          <div className="flex flex-wrap gap-3 mb-6 border-b border-gray-100 pb-4">
                            <Button
                              variant="default"
                              onClick={() => navigate(`/tickets/archived/${ticket.ticketId}`)}
                            >
                              View Details
                            </Button>
                          </div>

                          <div className="space-y-6">
                            {/* Description */}
                            <div className="lg:col-span-3 space-y-2">
                              <h4 className="text-sm font-bold text-gray-900">Description</h4>
                              <div className="p-3 bg-gray-50 rounded border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap">
                                {ticket.description || "No description provided."}
                              </div>
                            </div>

                            {/* Classification Grids */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="bg-gray-50 p-3 rounded border border-gray-100">
                                <div className="space-y-3">
                                  <h4 className="text-sm font-bold text-gray-900 border-b pb-1">Context</h4>
                                  <DetailRow label="Division" value={ticket.division?.divisionName} />
                                  <DetailRow label="Labor Dept" value={ticket.laborDepartment?.departmentName} />
                                  <DetailRow label="Sequence" value={ticket.sequence?.seqName} />
                                  <DetailRow label="Unit" value={ticket.unit?.unitName} />
                                </div>
                              </div>
                              <div className="bg-gray-50 p-3 rounded border border-gray-100">
                                <div className="space-y-3">
                                  <h4 className="text-sm font-bold text-gray-900 border-b pb-1">Classification</h4>
                                  <DetailRow label="Non-Conformance" value={(ticket.manNonCon as any)?.nonCon} />
                                  <DetailRow label="Drawing #" value={ticket.drawingNum} />
                                  <DetailRow label="Assigned To" value={ticket.assignedTo?.name || "Unassigned"} />
                                </div>
                              </div>
                            </div>

                            {/* check for correctiveAction or materialsUsed to verify if closing data exists */}
                            {(ticket.correctiveAction || ticket.materialsUsed) && (
                                <div className="bg-blue-50 p-3 rounded border border-blue-100 relative">
                                    <h4 className="text-sm font-bold text-blue-900 border-b border-blue-200 pb-1 mb-2">
                                        Resolution
                                    </h4>
                                    
                                    {ticket.closeDate && (
                                        <div className="absolute top-3 right-3 text-xs text-blue-600 font-medium bg-blue-100 px-2 py-0.5 rounded-full">
                                            Closed: {new Date(ticket.closeDate).toLocaleDateString()}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mb-4 mt-2">
                                        <DetailRow label="Est. Hours Lost" value={ticket.estimatedLaborHours?.toString()} />
                                        <DetailRow label="Materials Used" value={ticket.materialsUsed} />
                                    </div>
                                    
                                    <div className="pt-3 border-t border-blue-200">
                                        <span className="text-blue-900 text-xs uppercase tracking-wider font-semibold block mb-1">Corrective Action</span>
                                        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{ticket.correctiveAction || "N/A"}</p>
                                    </div>
                                </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
};

export default ArchiveList;