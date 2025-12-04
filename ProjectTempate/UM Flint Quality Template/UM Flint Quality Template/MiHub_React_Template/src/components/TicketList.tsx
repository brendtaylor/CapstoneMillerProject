import React, { useState, useEffect, useRef } from "react";
import ScaleLoader from "react-spinners/ScaleLoader";
import { useAuth } from './AuthContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '../hooks/use-toast';
import { useDebounce } from '../hooks/use-debounce';
import { useIsMobile } from '../hooks/use-mobile';
import { useNavigate } from "react-router-dom";
import { logAudit } from "./utils/auditLogger";

import { Ticket, WorkOrderSummary } from "../types"; 


// --- HELPERS ---

const DetailRow = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-100 pb-1 mb-1 last:border-0">
    <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">{label}</span>
    <span className="font-medium text-gray-900 text-sm text-right">{value || "-"}</span>
  </div>
);

const getStatusBadgeStyle = (statusId?: number): string => {
  switch (statusId) {
    case 0: return "bg-red-100 text-red-800"; // Open
    case 1: return "bg-yellow-100 text-yellow-800"; // In-Progress
    case 2: return "bg-green-100 text-green-800"; // Closed
    default: return "bg-gray-100 text-gray-800";
  }
};

const ticketMatchesTag = (ticket: Ticket, tag: string): boolean => {
  const t = tag.toLowerCase();

  return (
    ticket.ticketId?.toString().includes(t) ||
    ticket.qualityTicketId?.toLowerCase().includes(t) ||
    ticket.wo?.wo?.toLowerCase().includes(t) ||
    ticket.division?.divisionName?.toLowerCase().includes(t) ||
    ticket.laborDepartment?.departmentName?.toLowerCase().includes(t) ||
    ticket.sequence?.seqName?.toLowerCase().includes(t) ||
    ticket.unit?.unitName?.toLowerCase().includes(t) ||
    ticket.manNonCon?.nonCon?.toLowerCase().includes(t) ||
    ticket.drawingNum?.toLowerCase().includes(t) ||
    ticket.description?.toLowerCase().includes(t) ||
    ticket.initiator?.name?.toLowerCase().includes(t)
  );
};


const TicketList: React.FC = () => {
  // --- STATE MANAGEMENT ---
  
  // 1. Data Sources
  const [dashboardData, setDashboardData] = useState<WorkOrderSummary[]>([]); // The full list with counts
  const [searchResults, setSearchResults] = useState<WorkOrderSummary[] | null>(null); // The filtered list from search
  
  // 2. Ticket Cache: Key = WorkOrder ID, Value = Array of Tickets
  const [ticketsCache, setTicketsCache] = useState<Record<number, Ticket[]>>({});
  
  // Ref to track which WOs are cached (for SSE to know what to refresh without breaking closures)
  const ticketsCacheRef = useRef<Set<number>>(new Set());

  // Update ref whenever cache changes
  useEffect(() => {
    ticketsCacheRef.current = new Set(Object.keys(ticketsCache).map(Number));
  }, [ticketsCache]);
  
  // 3. Loading States
  const [loadingSummaries, setLoadingSummaries] = useState<boolean>(true);
  const [loadingWOs, setLoadingWOs] = useState<Record<number, boolean>>({}); 
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 4. UI State
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms delay
  // State to control open accordions
  const [openWorkOrders, setOpenWorkOrders] = useState<string[]>([]);
  const [openTickets, setOpenTickets] = useState<Record<string, string>>({}); // { [wo_number]: ticketId }
  
  const { userRole, userId } = useAuth();
  const [searchResult, setSearchResult] = useState<Ticket[] | null>(null);
  const [searchTags, setSearchTags] = useState<string[]>([]);

  const [statusFilter, setStatusFilter] = useState<string>('0,1');//::::
  // Load saved status filter
  useEffect(() => {
    const saved = localStorage.getItem("ticketStatusFilter");
    if (saved) setStatusFilter(saved);
  }, []);
  useEffect(() => {
  localStorage.setItem("ticketStatusFilter", statusFilter);
  }, [statusFilter]);
  
  useEffect(() => {
  // Close all accordions
  setOpenWorkOrders([]);
  setOpenTickets({});
  }, [statusFilter]);
  //attempting to make the ticket status easier to call
  const statusFilterRef = useRef(statusFilter);

  useEffect(() => {
    statusFilterRef.current = statusFilter;
  }, [statusFilter]);

  const buildUrl = (path: string, params: Record<string, any> = {}) => {
  const url = new URL(`http://localhost:3000${path}`);
  
  if (statusFilterRef.current) {
    url.searchParams.set("status", statusFilterRef.current);
  }

  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      url.searchParams.set(key, String(val));
    }
  });

  return url.toString();
};


  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Track scroll & Mobile View
  const [lastScrollPosition, setLastScrollPosition] = useState<number | null>(null);
  const [mobileDetailTicket, setMobileDetailTicket] = useState<Ticket | null>(null);
  const openMobileTicketDetail = (ticket: Ticket) => setMobileDetailTicket(ticket);
  const closeMobileTicketDetail = () => setMobileDetailTicket(null);

  // --- RENDER HELPERS ---
  const renderTicketDetailBody = (ticket: Ticket) => (
    <>
      <div className="flex flex-wrap gap-3 mb-6 border-b border-gray-100 pb-4">
        <Button
          variant="default"
          onClick={() => {
            closeMobileTicketDetail();
            navigate(`/tickets/${ticket.ticketId}`);
          }}
          className="flex-1 md:flex-none md:w-auto md:min-w-[120px]"
        >
          View Details
        </Button>

        {/* Admin: Edit + Delete */}
        {userRole === 'admin' && (
          <>
            <Button
              variant="destructive"
              onClick={() => {
                closeMobileTicketDetail();
                confirmAndArchive(ticket.ticketId, ticket.wo?.woId);
              }}
              className="flex-1 md:flex-none md:w-auto md:min-w-[120px]"
            >
              Delete Ticket
            </Button>
          </>
        )}

        {/* Editor: close ticket only */}
        {userRole === 'editor' && (
          <Button
              variant="secondary"
              onClick={() => navigate('/tickets/${ticket.ticketId}?close=true')}
              className="flex-1 md:flex-none md:w-auto md:min-w-[120px]"
            >
              Close Ticket
            </Button>
          )}
      </div>

      <div className="space-y-6">
        {/* --- Description --- */}
        <div className="lg:col-span-3 space-y-2">
          <h4 className="text-sm font-bold text-gray-900">Description</h4>
          <div className="p-3 bg-gray-50 rounded border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap break-words">
            {ticket.description && ticket.description.length > 300 ? (
              <>
                {`${ticket.description.substring(0, 300)}...`}
                <span className="block mt-2 text-xs text-gray-500 italic">For the full description, tap "View Details"</span>
              </>
            ) : (
              ticket.description || "No description provided."
            )}
          </div>
        </div>

        {/* --- Context & Classification --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-3 rounded border border-gray-100">
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-900 border-b pb-1">Context</h4>
              <DetailRow label="Division" value={ticket.division?.divisionName} />
              <DetailRow label="Labor Dept" value={ticket.laborDepartment?.departmentName} />
              <DetailRow label="Sequence" value={ticket.sequence ? ticket.sequence.seqName : 'N/A'} />
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

        {/* --- Resolution (Cleaned: No Legacy Fallback) --- */}
        {ticket.closures && ticket.closures.length > 0 && (
            <div className="space-y-4">
               {ticket.closures
                 .slice() // Copy before sorting
                 .sort((a, b) => new Date(b.cycleCloseDate).getTime() - new Date(a.cycleCloseDate).getTime()) // Newest first
                 .map((closure, idx) => (
                  <div key={closure.id || idx} className="bg-blue-50 p-3 rounded border border-blue-100 relative">
                    <h4 className="text-sm font-bold text-blue-900 border-b border-blue-200 pb-1 mb-2">
                        Resolution Cycle {ticket.closures && ticket.closures.length > 1 ? `#${ticket.closures.length - idx}` : ''}
                    </h4>
                    
                    {/* Date Badge */}
                    <div className="absolute top-3 right-3 text-xs text-blue-600 font-medium bg-blue-100 px-2 py-0.5 rounded-full">
                         {closure.cycleStartDate ? `${new Date(closure.cycleStartDate).toLocaleDateString()} — ` : ''}
                         {new Date(closure.cycleCloseDate).toLocaleDateString()}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3 mb-4 mt-2">
                      <DetailRow label="Closed By" value={closure.closedBy?.name || "Unknown"} />
                      <DetailRow label="Est. Hours Lost" value={closure.estimatedLaborHours?.toString()} />
                      <DetailRow label="Materials" value={closure.materialsUsed} />
                    </div>
                    
                    <div className="pt-3 border-t border-blue-200">
                      <span className="text-blue-900 text-xs uppercase tracking-wider font-semibold block mb-1">Corrective Action</span>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{closure.correctiveAction || "N/A"}</p>
                    </div>
                  </div>
               ))}
            </div>
        )}
      </div>
    </>
  );
  
  // Archive/Edit Modal States
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [ticketToArchive, setTicketToArchive] = useState<{id: number, woId?: number} | null>(null);

  // --- API HANDLERS ---
  // 1. Initial Load: Get Summary (with counts)
  const fetchWOSummaries = async () => {
    // Only set loading on initial fetch if dashboard is empty, to avoid flashing on updates
    if (dashboardData.length === 0) setLoadingSummaries(true);
    
    try {
      const response = await fetch(buildUrl("/api/work-orders-summary"), {
            headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
        });
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data: WorkOrderSummary[] = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error(err);
      if (dashboardData.length === 0) setError("Failed to fetch dashboard data.");
    } finally {
      setLoadingSummaries(false);
    }
  };

  useEffect(() => {fetchWOSummaries();}, [debouncedSearchTerm, statusFilter]);

  // 2. Search Handler
  useEffect(() => {
    const performSearch = async () => {
        if (!debouncedSearchTerm) {
            setSearchResults(null);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        try {
        
        const response = await fetch(buildUrl('/api/work-orders-summary', { search: debouncedSearchTerm }));
        
          if (!response.ok) throw new Error("Search failed");
          
          const results: WorkOrderSummary[] = await response.json();
          setSearchResults(results);
            
        } catch (e) {
            console.error(e);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };
    performSearch();
  }, [debouncedSearchTerm]);

  // 3. Lazy Load Tickets
  const fetchTicketsForWO = async (woId: number, forceRefresh = false) => {
    if (!forceRefresh && ticketsCache[woId]) return;

    setLoadingWOs(prev => ({ ...prev, [woId]: true }));
    try {
        
        const response = await fetch(
        buildUrl(`/api/work-orders/${woId}/tickets`),
        {
          headers: { 'Cache-Control': 'no-cache' },
        }
        );

      if (!response.ok) throw new Error("Failed to fetch tickets");
      const data: Ticket[] = await response.json();
      
      setTicketsCache(prev => ({
      ...prev,
      [woId]: data
      }));

    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not load tickets." });
    } finally {
        setLoadingWOs(prev => ({ ...prev, [woId]: false }));
    }
  };
    // refresh tickets when statusFilter changes
  useEffect(() => {
    openWorkOrders.forEach((woNumber) => {
      const woId = dashboardData.find((wo) => wo.wo_number === woNumber)?.wo_id;
      if (woId) fetchTicketsForWO(woId, true); 
    });
  }, [statusFilter, openWorkOrders]);

  // 4. SSE REAL-TIME UPDATES
  useEffect(() => {
    const eventSource = new EventSource('http://localhost:3000/api/tickets/events');
    
    eventSource.onopen = () => console.log("SSE Connected");

    const handleCreateOrUpdate = (e: MessageEvent) => {
        const ticket = JSON.parse(e.data);
        console.log("SSE Event:", e.type);

        // A. Always refresh the summaries to update counts
        fetchWOSummaries();

        // B. If this ticket's WO is currently expanded (cached), refresh the tickets list
        const woId = ticket.wo?.woId;
        if (woId && ticketsCacheRef.current.has(woId)) {
            fetchTicketsForWO(woId, true); // Force refresh
        }
    };

    const handleDelete = (e: MessageEvent) => {
        const { id } = JSON.parse(e.data);
        
        // A. Refresh Summaries
        fetchWOSummaries();

        // B. Manually remove from cache if present (since we don't have WO ID easily in event)
        setTicketsCache(prev => {
            const newCache = { ...prev };
            let found = false;
            for (const woIdStr of Object.keys(newCache)) {
                const woId = Number(woIdStr);
                const list = newCache[woId];
                if (list.some(t => t.ticketId === id)) {
                    newCache[woId] = list.filter(t => t.ticketId !== id);
                    found = true;
                }
            }
            return found ? newCache : prev;
        });
    };

    eventSource.addEventListener('new-ticket', handleCreateOrUpdate);
    eventSource.addEventListener('update-ticket', handleCreateOrUpdate);
    eventSource.addEventListener('delete-ticket', handleDelete);

    return () => {
        console.log("Closing SSE");
        eventSource.close();
    };
  }, []);

  // Scroll margin logic
  useEffect(() => {
    const setTicketMargins = () => {
      const header = document.querySelector('nav, header, .navbar') || document.querySelector('[class*="bg-muted"]');
      let headerHeight = header ? header.getBoundingClientRect().height : 0;
      const paddingTop = isMobile ? 10 : 20;
      const marginTop = headerHeight + paddingTop;
      const tickets = document.querySelectorAll('[id^="ticket-"]');
      tickets.forEach(ticket => { if (ticket instanceof HTMLElement) ticket.style.scrollMarginTop = `${marginTop}px`; });
    };
    setTicketMargins();
    const observer = new MutationObserver(setTicketMargins);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', setTicketMargins);
    return () => { observer.disconnect(); window.removeEventListener('resize', setTicketMargins); };
  }, [isMobile, ticketsCache]); 

  // --- ACTIONS ---

  const handleArchive = async (ticketId: number, woId?: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      toast({ title: "Success", description: `Ticket has been deleted.` });
      
      // --- Immediate UI Update ---
      if (woId) {
        setTicketsCache(prev => ({
          ...prev,
          [woId]: prev[woId]?.filter(t => t.ticketId !== ticketId) || [],
        }));

        // 2. Decrement the summary count for that WO
        setDashboardData(prev => prev.map(summary => 
          summary.wo_id === woId 
            ? { ...summary, open_ticket_count: Math.max(0, summary.open_ticket_count - 1) }
            : summary
        ));

        // 3. Log the audit action
        const woNumber = dashboardData.find(wo => wo.wo_id === woId)?.wo_number;
        if (woNumber) {
          await logAudit(userId, "Archive", ticketId, parseInt(woNumber, 10));
        }
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Archive Failed", description: err.message });
    }
  };

  const confirmAndArchive = async (ticketId: number, woId?: number) => {
    setTicketToArchive({id: ticketId, woId});
    setShowArchiveConfirm(true);
  };

  useEffect(() => {
    document.body.style.overflow = mobileDetailTicket ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileDetailTicket]);


  // --- RENDER ---
  
  // Decide what to display: Search Results OR Dashboard Data
  const displayedData = searchResults ?? dashboardData;
  const sortedWOs = [...displayedData].sort((a, b) => a.wo_number.localeCompare(b.wo_number));

  if (loadingSummaries && !searchResults) return <div className="flex justify-center items-center p-4"><ScaleLoader color="#3b82f6" /> <span className="ml-2">Loading Dashboard...</span></div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div>
      {/* --- SEARCH BAR --- */}
      <div className="flex items-center gap-4 mb-6">
        <Input
          type="text"
          placeholder="Search by Work Order..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm bg-white"
        />
        <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-gray-300 rounded-md p-2"
            >
                <option value="0,1">Open & In-Progress</option>
                <option value="2">Closed</option>
                <option value="0">Open</option>
                <option value="1">In-Progress</option>
            </select>
        {isSearching && <ScaleLoader color="#3b82f6" height={20} />}
      </div>
      <div className="space-y-4">
        {(sortedWOs.length === 0 && !loadingSummaries) ? (
             <div className="text-center p-8 text-gray-500 bg-white rounded shadow-sm">
                {searchTerm ? 'No work orders found matching your search.' : 'No active work orders.'}
             </div>
        ) : (
        <Accordion 
            type="multiple" 
            className="w-full space-y-2"
            value={openWorkOrders}
            onValueChange={setOpenWorkOrders}
        >
            {sortedWOs.map((woSummary) => {
                const count = woSummary.open_ticket_count;
                return (
                <AccordionItem 
                    key={woSummary.wo_id} 
                    value={woSummary.wo_number} 
                    className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden"
                >
                <AccordionTrigger 
                    onClick={() => fetchTicketsForWO(woSummary.wo_id)}
                    className="px-6 py-4 hover:bg-gray-50 hover:no-underline transition-colors"
                >
                <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-gray-800">{woSummary.wo_number}</span>
                    {count !== undefined && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {count} Ticket{count !== 1 && 's'}
                        </span>
                    )}
                </div>
                </AccordionTrigger>
                
                <AccordionContent className="px-6 pb-6 pt-2 bg-gray-50/50">
                    {loadingWOs[woSummary.wo_id] ? (
                        <div className="flex justify-center p-4"><ScaleLoader height={15} color="#3b82f6" /></div>
                    ) : !ticketsCache[woSummary.wo_id] || ticketsCache[woSummary.wo_id].length === 0 ? (
                         <div className="text-center text-gray-500 italic p-2">No tickets found for this Work Order.</div>
                    ) : (
                        <Accordion 
                            type="single" 
                            collapsible 
                            className="w-full space-y-2"
                            value={openTickets[woSummary.wo_number] || ''}
                            onValueChange={(value) => setOpenTickets(prev => ({ ...prev, [woSummary.wo_number]: value }))}
                        >
                            {ticketsCache[woSummary.wo_id].map((ticket) => {
                                return (
                                <AccordionItem 
                                    id={`ticket-${ticket.ticketId}`}
                                    key={ticket.ticketId} 
                                    value={ticket.ticketId.toString()}
                                    className="border border-gray-200 bg-white rounded-md"
                                >
                                    <AccordionTrigger 
                                        className="px-4 py-3 hover:bg-gray-50 hover:no-underline"
                                        onMouseDown={(e) => { // Use onMouseDown to prevent focus race conditions
                                            if (isMobile) {
                                                e.preventDefault(); e.stopPropagation();
                                                openMobileTicketDetail(ticket); return;
                                            }
                                            const isClosing = (e.currentTarget.closest('[data-state]')?.getAttribute('data-state') === 'open');
                                            if (isClosing && lastScrollPosition !== null) {
                                                window.scrollTo({ top: lastScrollPosition, behavior: 'smooth' });
                                                setLastScrollPosition(null);
                                            } else {
                                                setLastScrollPosition(window.scrollY);
                                                setTimeout(() => {
                                                    const el = document.getElementById(`ticket-${ticket.ticketId}`);
                                                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                                }, 150);
                                            }
                                        }}
                                    >
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
                                      {renderTicketDetailBody(ticket)}
                                    </AccordionContent>
                                </AccordionItem>
                                );
                            })}
                        </Accordion>
                    )}
                </AccordionContent>
                </AccordionItem>
            )})}
        </Accordion>
        )}
      </div>

      {isMobile && mobileDetailTicket && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl max-h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeMobileTicketDetail} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">X</button>
            <div className="px-4 py-6 space-y-4">
              <h3 className="text-lg font-semibold">{mobileDetailTicket.qualityTicketId || mobileDetailTicket.ticketId}</h3>
              {renderTicketDetailBody(mobileDetailTicket)}
            </div>
          </div>
        </div>
      )}

      {showArchiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" >
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold mb-2">Delete Ticket?</h3>
                <div className="flex justify-end space-x-3">
                    <button onClick={() => { setShowArchiveConfirm(false); setTicketToArchive(null); }} className="px-4 py-2 bg-gray-600 text-white rounded">Cancel</button>
                    <button onClick={() => { if (ticketToArchive) { handleArchive(ticketToArchive.id, ticketToArchive.woId); setShowArchiveConfirm(false); setTicketToArchive(null); } }} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default TicketList;
