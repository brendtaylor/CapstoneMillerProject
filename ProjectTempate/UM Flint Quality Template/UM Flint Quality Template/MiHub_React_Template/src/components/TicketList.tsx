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

import { 
  Ticket, 
  Division, 
  WorkOrder, 
  Unit, 
  Sequence, 
  LaborDepartment,
  Nonconformance,
  WorkOrderSummary
} from "../types"; 


// Local interfaces to match the specific API responses expected by the Form logic
interface ManNonCon {
    nonConId: number;
    nonCon: string;
}

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
    ticket.sequence?.sequenceName?.toLowerCase().includes(t) ||
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed' | 'inprogress'>('all');
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
        {userRole === 'admin' && (
          <>
            <Button
              variant="secondary"
              onClick={() => {
                closeMobileTicketDetail();
                handleEdit(ticket);
              }}
              className="flex-1 md:flex-none md:w-auto md:min-w-[120px]"
            >
              Edit Ticket
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                closeMobileTicketDetail();
                confirmAndArchive(ticket.ticketId, ticket.wo?.woId);
              }}
              className="flex-1 md:flex-none md:w-auto md:min-w-[120px]"
            >
              Archive Ticket
            </Button>
          </>
        )}
      </div>

      <div className="space-y-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-3 rounded border border-gray-100">
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-900 border-b pb-1">Context</h4>
              <DetailRow label="Division" value={ticket.division?.divisionName} />
              <DetailRow label="Labor Dept" value={ticket.laborDepartment?.departmentName} />
              <DetailRow label="Sequence" value={ticket.sequence ? ticket.sequence.sequenceName : 'N/A'} />
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
        {ticket.status?.statusId === 2 && (
          <div className="bg-blue-50 p-3 rounded border border-blue-100">
            <h4 className="text-sm font-bold text-blue-900 border-b border-blue-200 pb-1">Resolution</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3 mt-2 mb-4">
              <DetailRow label="Closed Date" value={ticket.closeDate ? new Date(ticket.closeDate).toLocaleDateString() : 'N/A'} />
              <DetailRow label="Est. Hours Lost" value={ticket.estimatedLaborHours?.toString()} />
              <DetailRow label="Materials" value={ticket.materialsUsed} />
            </div>
            <div className="pt-3 border-t border-blue-200">
              <span className="text-blue-900 text-xs uppercase tracking-wider font-semibold block mb-1">Corrective Action</span>
              <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{ticket.correctiveAction || "N/A"}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
  
  // Archive/Edit Modal States
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [ticketToArchive, setTicketToArchive] = useState<{id: number, woId?: number} | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Edit Dropdown Data
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [laborDepts, setLaborDepts] = useState<LaborDepartment[]>([]);
  const [manNonCons, setNonconformances] = useState<Nonconformance[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [sequences, setSequences] = useState<Sequence[]>([]);

  // Edit Fields
  const [editFields, setEditFields] = useState({
    status: '', divisionId: '', workOrderId: '', laborDeptId: '', 
    manNonConId: '', unitId: '', sequenceId: '', drawingNum: '', description: '',
  });

  const [editDivisionSearch, setEditDivisionSearch] = useState('');
  const [editWorkOrderSearch, setEditWorkOrderSearch] = useState('');
  const [editLaborDeptText, setEditLaborDeptText] = useState('');
  const [editNonconformanceText, setEditNonconformanceText] = useState('');
  const [editUnitText, setEditUnitText] = useState('');
  const [editSequenceText, setEditSequenceText] = useState('');

  const debouncedEditDivisionSearch = useDebounce(editDivisionSearch, 300);
  const debouncedEditWorkOrderSearch = useDebounce(editWorkOrderSearch, 300);

  // --- API HANDLERS ---

  // 1. Initial Load: Get Summary (with counts)
  const fetchWOSummaries = async () => {
    // Only set loading on initial fetch if dashboard is empty, to avoid flashing on updates
    if (dashboardData.length === 0) setLoadingSummaries(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/work-orders-summary', {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
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

  useEffect(() => { fetchWOSummaries(); }, []);

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
            const response = await fetch(`http://localhost:3000/api/work-orders-summary?search=${encodeURIComponent(debouncedSearchTerm)}`);
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
      const response = await fetch(`http://localhost:3000/api/work-orders/${woId}/tickets`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
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

  // --- EDIT FORM DATA FETCHING ---

  const fetchGlobalDropdownData = async (endpoint: string, setter: React.Dispatch<React.SetStateAction<any[]>>, search: string = '') => {
    try {
      const url = search ? `http://localhost:3000/api/${endpoint}?search=${search}` : `http://localhost:3000/api/${endpoint}`;
      const response = await fetch(url);
      if (response.ok) setter(await response.json());
    } catch (error) { console.error(`Failed to fetch ${endpoint}:`, error); }
  };

  useEffect(() => { 
    if (isEditing) fetchGlobalDropdownData('divisions', setDivisions, debouncedEditDivisionSearch); 
  }, [debouncedEditDivisionSearch, isEditing]);
  
  useEffect(() => { 
    if (isEditing) fetchGlobalDropdownData('work-orders', setWorkOrders, debouncedEditWorkOrderSearch); 
  }, [debouncedEditWorkOrderSearch, isEditing]);

  useEffect(() => {
    const fetchFilteredData = async () => {
        if (!isEditing || !editFields.workOrderId) {
            setLaborDepts([]); setNonconformances([]); setUnits([]); setSequences([]);
            return;
        }
        try {
            const [deptRes, nonConRes, unitRes, seqRes] = await Promise.all([
                fetch(`http://localhost:3000/api/work-orders/${editFields.workOrderId}/labor-departments`),
                fetch(`http://localhost:3000/api/work-orders/${editFields.workOrderId}/nonconformances`),
                fetch(`http://localhost:3000/api/work-orders/${editFields.workOrderId}/units`),
                fetch(`http://localhost:3000/api/work-orders/${editFields.workOrderId}/sequences`)
            ]);
            if (deptRes.ok) setLaborDepts(await deptRes.json());
            if (nonConRes.ok) setNonconformances(await nonConRes.json());
            if (unitRes.ok) setUnits(await unitRes.json());
            if (seqRes.ok) setSequences(await seqRes.json());
        } catch (error) { console.error("Failed to fetch filtered data", error); }
    };
    fetchFilteredData();
  }, [editFields.workOrderId, isEditing]);

  // --- ACTIONS ---

  const handleArchive = async (ticketId: number, woId?: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}`, { method: 'DELETE' });
      if (!response.ok) {
        let errorMessage = `Failed to archive ticket. Status: ${response.status}`;
        try { const errorData = await response.json(); errorMessage = errorData.message || errorMessage; } catch (e) { /* Ignore */ }
        throw new Error(errorMessage);
      }
      toast({ title: "Success", description: `Ticket ${qualityTicketId} has been archived.` });

      const woId = ticket?.wo?.wo ? parseInt(ticket.wo.wo, 10) : undefined;

      await logAudit("Archive", ticketId, woId);


      fetchTickets();
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      toast({ title: "Success", description: `Ticket has been archived.` });
      // SSE will handle updates
    } catch (err: any) {
      toast({ variant: "destructive", title: "Archive Failed", description: err.message });
    }
  };

  const confirmAndArchive = async (ticketId: number) => {
    setTicketToArchive(ticketId);
  const confirmAndArchive = (ticketId: number, woId?: number) => {
    setTicketToArchive({id: ticketId, woId});
    setShowArchiveConfirm(true);
    
  };

  const handleEdit = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setIsEditing(true);
    

    setEditFields({
      status: ticket.status?.statusId?.toString() || '0',
      divisionId: ticket.division?.divisionId?.toString() || '',
      workOrderId: ticket.wo?.woId?.toString() || '',
      laborDeptId: ticket.laborDepartment?.departmentId?.toString() || '',
      manNonConId: ticket.manNonCon?.nonConId?.toString() || '',
      unitId: ticket.unit?.unitId?.toString() || '',
      sequenceId: ticket.sequence?.sequenceId?.toString() || '',
      drawingNum: ticket.drawingNum || '', description: ticket.description || '',
    });

    setEditDivisionSearch(ticket.division?.divisionName || '');
    setEditWorkOrderSearch(ticket.wo?.wo || '');
    setEditLaborDeptText(ticket.laborDepartment?.departmentName || '');
    setEditNonconformanceText((ticket.manNonCon as any)?.nonCon || '');
    setEditUnitText(ticket.unit?.unitName || '');
    setEditSequenceText(ticket.sequence?.sequenceName || '');
    
    fetchGlobalDropdownData('divisions', setDivisions);
    fetchGlobalDropdownData('work-orders', setWorkOrders);
  };

  useEffect(() => {
    document.body.style.overflow = (isEditing || mobileDetailTicket) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isEditing, mobileDetailTicket]);

  const handleSaveEdit = async () => {
    if (!editingTicket) return;
    if (!userId) { toast({ variant: "destructive", title: "Error", description: "User not identified." }); return; }
    if (!editFields.divisionId || !editFields.workOrderId || !editFields.laborDeptId || !editFields.manNonConId || !editFields.description) { 
        toast({ variant: "destructive", title: "Validation Error", description: "Fill required fields." }); return; 
    }

    
    // Validation (Matching FileForm logic)
    if (!editFields.divisionId) { toast({ variant: "destructive", title: "Validation Error", description: "'Division' field is empty." }); return; }
    if (!editFields.workOrderId) { toast({ variant: "destructive", title: "Validation Error", description: "'Work Order' field is empty." }); return; }
    if (!editFields.laborDeptId) { toast({ variant: "destructive", title: "Validation Error", description: "'Labor Department' field is empty." }); return; }
    if (!editFields.manNonConId) { toast({ variant: "destructive", title: "Validation Error", description: "'Manufacturing Nonconformance' field is empty." }); return; }
    if (!editFields.description) { toast({ variant: "destructive", title: "Validation Error", description: "Description is a required field." }); return; }

    try {
      const payload = {
        status: parseInt(editFields.status),
        description: editFields.description,
        drawingNum: editFields.drawingNum, 
        initiator: userId, 
        division: parseInt(editFields.divisionId),
        wo: parseInt(editFields.workOrderId),
        laborDepartment: parseInt(editFields.laborDeptId),
        manNonCon: parseInt(editFields.manNonConId),
        ...(editFields.unitId && { unit: parseInt(editFields.unitId) }),
        ...(editFields.sequenceId && { sequence: parseInt(editFields.sequenceId) }),
      };

      const response = await fetch(`http://localhost:3000/api/tickets/${editingTicket.ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Failed to update ticket.`);

      if (!success) throw new Error(`Failed to update ticket. Status: ${response.status}`);

      toast({ title: "Success", description: `Ticket ${editingTicket.qualityTicketId} has been updated.` });
      

      //const numericTicketId = Number(editingTicket.qualityTicketId);

      await logAudit("Edit", editingTicket.ticketId, parseInt(editingTicket.wo?.wo));

      fetchTickets();
      toast({ title: "Success", description: `Ticket ${editingTicket.qualityTicketId} has been updated.` });     
      // SSE will handle updates
      setIsEditing(false);
      setEditingTicket(null);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update Failed", description: err.message });
    }
    
  };

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
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 p-4" onClick={closeMobileTicketDetail}>
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl max-h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeMobileTicketDetail} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">X</button>
            <div className="px-4 py-6 space-y-4">
              <h3 className="text-lg font-semibold">{mobileDetailTicket.qualityTicketId || mobileDetailTicket.ticketId}</h3>
              {renderTicketDetailBody(mobileDetailTicket)}
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-3xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsEditing(false)} className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center bg-red-600 text-white text-2xl font-bold rounded-lg hover:bg-red-700">✕</button>
            <h2 className="text-xl font-semibold mb-4">Edit Ticket</h2>
            <div className="space-y-6">
                <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select value={editFields.status} onChange={(e) => setEditFields({ ...editFields, status: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                    <option value="0">Open</option><option value="1">In Progress</option><option value="2">Closed</option>
                </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Division *</label>
                    <input list="edit-div-list" value={editDivisionSearch} onChange={(e) => { setEditDivisionSearch(e.target.value); const s = divisions.find(d => d.divisionName === e.target.value); setEditFields({ ...editFields, divisionId: s ? String(s.divisionId) : '' }); }} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                    <datalist id="edit-div-list">{divisions.map(d => <option key={d.divisionId} value={d.divisionName} />)}</datalist>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Work Order *</label>
                    <input list="edit-wo-list" value={editWorkOrderSearch} onChange={(e) => { setEditWorkOrderSearch(e.target.value); const s = workOrders.find(w => String(w.wo) === e.target.value); setEditFields({ ...editFields, workOrderId: s ? String(s.woId) : '', laborDeptId: '', manNonConId: '', unitId: '', sequenceId: '' }); setEditLaborDeptText(''); setEditNonconformanceText(''); setEditUnitText(''); setEditSequenceText(''); }} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                    <datalist id="edit-wo-list">{workOrders.map(w => <option key={w.woId} value={w.wo} />)}</datalist>
                </div>
                {/* Dependent Fields */}
                <div><label className="block text-sm font-medium text-gray-700">Labor Dept *</label><input list="edit-dept-list" value={editLaborDeptText} disabled={!editFields.workOrderId} onChange={(e) => { setEditLaborDeptText(e.target.value); const s = laborDepts.find(d => d.departmentName === e.target.value); setEditFields({...editFields, laborDeptId: s ? String(s.departmentId) : ''})}} className="mt-1 w-full border border-gray-300 rounded p-2 disabled:bg-gray-100"/><datalist id="edit-dept-list">{laborDepts.map(d => <option key={d.departmentId} value={d.departmentName}/>)}</datalist></div>
                <div><label className="block text-sm font-medium text-gray-700">Nonconformance *</label><input list="edit-nc-list" value={editNonconformanceText} disabled={!editFields.workOrderId} onChange={(e) => { setEditNonconformanceText(e.target.value); const s = manNonCons.find(m => m.nonCon === e.target.value); setEditFields({...editFields, manNonConId: s ? String(s.nonConId) : ''})}} className="mt-1 w-full border border-gray-300 rounded p-2 disabled:bg-gray-100"/><datalist id="edit-nc-list">{manNonCons.map(m => <option key={m.nonConId} value={m.nonCon}/>)}</datalist></div>
                <div><label className="block text-sm font-medium text-gray-700">Unit</label><input list="edit-unit-list" value={editUnitText} disabled={!editFields.workOrderId} onChange={(e) => { setEditUnitText(e.target.value); const s = units.find(u => u.unitName === e.target.value); setEditFields({...editFields, unitId: s ? String(s.unitId) : ''})}} className="mt-1 w-full border border-gray-300 rounded p-2 disabled:bg-gray-100"/><datalist id="edit-unit-list">{units.map(u => <option key={u.unitId} value={u.unitName}/>)}</datalist></div>
                <div><label className="block text-sm font-medium text-gray-700">Sequence</label><input list="edit-seq-list" value={editSequenceText} disabled={!editFields.workOrderId} onChange={(e) => { setEditSequenceText(e.target.value); const s = sequences.find(q => q.sequenceName === e.target.value); setEditFields({...editFields, sequenceId: s ? String(s.sequenceId) : ''})}} className="mt-1 w-full border border-gray-300 rounded p-2 disabled:bg-gray-100"/><datalist id="edit-seq-list">{sequences.map(s => <option key={s.sequenceId} value={s.sequenceName}/>)}</datalist></div>
                <div><label className="block text-sm font-medium text-gray-700">Drawing #</label><input type="text" value={editFields.drawingNum} onChange={(e) => setEditFields({...editFields, drawingNum: e.target.value})} className="mt-1 w-full border border-gray-300 rounded p-2"/></div>
                <div><label className="block text-sm font-medium text-gray-700">Description *</label><textarea rows={4} value={editFields.description} onChange={(e) => setEditFields({...editFields, description: e.target.value})} className="mt-1 w-full border border-gray-300 rounded p-2"/></div>
            </div>
            <div className="flex justify-end mt-6"><button onClick={() => setShowSubmitConfirm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save</button></div>
            {showSubmitConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-2">Confirm</h3>
                        <p className="text-sm text-gray-700 mb-4">Submit changes?</p>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setShowSubmitConfirm(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded">Cancel</button>
                            <button onClick={async () => { setShowSubmitConfirm(false); await handleSaveEdit(); }} className="px-4 py-2 bg-blue-600 text-white rounded">Submit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
    )}

      {showArchiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold mb-2">Archive Ticket</h3>
                <div className="flex justify-end space-x-3">
                    <button onClick={() => { setShowArchiveConfirm(false); setTicketToArchive(null); }} className="px-4 py-2 bg-gray-600 text-white rounded">Cancel</button>
                    <button onClick={() => { if (ticketToArchive) { handleArchive(ticketToArchive.id, ticketToArchive.woId); setShowArchiveConfirm(false); setTicketToArchive(null); } }} className="px-4 py-2 bg-red-600 text-white rounded">Archive</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default TicketList;