import React, { useState, useEffect } from "react";
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

import { 
  Ticket, 
  Division, 
  WorkOrder, 
  Unit, 
  Sequence, 
  LaborDepartment
} from "../types"; 

// Local interfaces to match the specific API responses expected by the Form logic
interface ManNonCon {
    nonConId: number;
    nonCon: string;
}

// Helper component for consistent data rows
const DetailRow = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-100 pb-1 mb-1 last:border-0">
    <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">{label}</span>
    <span className="font-medium text-gray-900 text-sm text-right">{value || "-"}</span>
  </div>
);

const TicketList: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const { userRole, userId } = useAuth();
  const [searchResult, setSearchResult] = useState<Ticket[] | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Track scroll position
  const [lastScrollPosition, setLastScrollPosition] = useState<number | null>(null);
  
  // Archive Modal State
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [ticketToArchive, setTicketToArchive] = useState<number | null>(null);

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // --- Dropdown Data State (Edit Form) ---
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  
  // Filtered Lists (Dependent on Work Order)
  const [laborDepts, setLaborDepts] = useState<LaborDepartment[]>([]);
  const [manNonCons, setManNonCons] = useState<ManNonCon[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [sequences, setSequences] = useState<Sequence[]>([]);

  // Edit Form Fields
  const [editFields, setEditFields] = useState({
    status: '',
    divisionId: '',
    workOrderId: '',
    laborDeptId: '',
    manNonConId: '',
    unitId: '',
    sequenceId: '',
    drawingNum: '', // Text Input
    description: '',
  });

  // Edit Form Search/Display Text
  const [editDivisionSearch, setEditDivisionSearch] = useState('');
  const [editWorkOrderSearch, setEditWorkOrderSearch] = useState('');
  
  // For filtered lists, we hold the selection text for the input display
  const [editLaborDeptText, setEditLaborDeptText] = useState('');
  const [editManNonConText, setEditManNonConText] = useState('');
  const [editUnitText, setEditUnitText] = useState('');
  const [editSequenceText, setEditSequenceText] = useState('');

  // Debounced Search Hooks (For Global Lists)
  const debouncedEditDivisionSearch = useDebounce(editDivisionSearch, 300);
  const debouncedEditWorkOrderSearch = useDebounce(editWorkOrderSearch, 300);

  // --- API HANDLERS ---

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/api/tickets', {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      if (!response.ok) throw new Error(`Network response was not ok, status: ${response.status}`);
      const data = await response.json();
      setTickets(data);
    } catch (err) {
      setError("Failed to fetch tickets. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  useEffect(() => {
    const handleTicketCreated = () => { fetchTickets(); };
    window.addEventListener('ticketCreated', handleTicketCreated);
    return () => window.removeEventListener('ticketCreated', handleTicketCreated);
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
  }, [isMobile]);

  // --- EDIT FORM DATA FETCHING ---

  // 1. Fetch Global Lists (Division, Work Order)
  const fetchGlobalDropdownData = async (endpoint: string, setter: React.Dispatch<React.SetStateAction<any[]>>, search: string = '') => {
    try {
      const url = search ? `http://localhost:3000/api/${endpoint}?search=${search}` : `http://localhost:3000/api/${endpoint}`;
      const response = await fetch(url);
      if (response.ok) {
        setter(await response.json());
      }
    } catch (error) {
      console.error(`Failed to fetch ${endpoint}:`, error);
    }
  };

  // Effects for Global Dropdowns (only when editing)
  useEffect(() => { 
    if (isEditing) fetchGlobalDropdownData('divisions', setDivisions, debouncedEditDivisionSearch); 
  }, [debouncedEditDivisionSearch, isEditing]);
  
  useEffect(() => { 
    if (isEditing) fetchGlobalDropdownData('work-orders', setWorkOrders, debouncedEditWorkOrderSearch); 
  }, [debouncedEditWorkOrderSearch, isEditing]);

  // 2. Fetch Filtered Lists (Dependent on Work Order)
  useEffect(() => {
    const fetchFilteredData = async () => {
        // Only run if editing and we have a valid Work Order ID
        if (!isEditing || !editFields.workOrderId) {
            setLaborDepts([]);
            setManNonCons([]);
            setUnits([]);
            setSequences([]);
            return;
        }

        try {
            // Fetch all dependencies in parallel based on Work Order ID
            const [deptRes, nonConRes, unitRes, seqRes] = await Promise.all([
                fetch(`http://localhost:3000/api/work-orders/${editFields.workOrderId}/labor-departments`),
                fetch(`http://localhost:3000/api/work-orders/${editFields.workOrderId}/nonconformances`),
                fetch(`http://localhost:3000/api/work-orders/${editFields.workOrderId}/units`),
                fetch(`http://localhost:3000/api/work-orders/${editFields.workOrderId}/sequences`)
            ]);

            if (deptRes.ok) setLaborDepts(await deptRes.json());
            if (nonConRes.ok) setManNonCons(await nonConRes.json());
            if (unitRes.ok) setUnits(await unitRes.json());
            if (seqRes.ok) setSequences(await seqRes.json());

        } catch (error) {
            console.error("Failed to fetch filtered data for Work Order:", error);
        }
    };

    fetchFilteredData();
  }, [editFields.workOrderId, isEditing]);


  // --- ACTIONS (Archive, Edit, Search) ---

  const handleArchive = async (ticketId: number) => {
    // Find the ticket to get its qualityTicketId for the success message
    const ticket = tickets.find(t => t.ticketId === ticketId);
    const qualityTicketId = ticket?.qualityTicketId || `ID ${ticketId}`;

    try {
      const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}`, { method: 'DELETE' });
      if (!response.ok) {
        let errorMessage = `Failed to archive ticket. Status: ${response.status}`;
        try { const errorData = await response.json(); errorMessage = errorData.message || errorMessage; } catch (e) { /* Ignore */ }
        throw new Error(errorMessage);
      }
      toast({ title: "Success", description: `Ticket ${qualityTicketId} has been archived.` });
      fetchTickets();
    } catch (err: any) {
      console.error("Archive error:", err);
      toast({ variant: "destructive", title: "Archive Failed", description: err.message || "An unexpected error occurred." });
    }
  };

  const confirmAndArchive = (ticketId: number) => {
    setTicketToArchive(ticketId);
    setShowArchiveConfirm(true);
  };

  const handleEdit = (ticketId: number) => {
    const ticket = tickets.find((t) => t.ticketId === ticketId);
    if (!ticket) return;
    
    setEditingTicket(ticket);
    setIsEditing(true);

    // Map properties
    setEditFields({
      status: ticket.status?.statusDescription || '',
      divisionId: ticket.division?.divisionId?.toString() || '',
      workOrderId: ticket.wo?.woId?.toString() || '',
      laborDeptId: ticket.laborDepartment?.departmentId?.toString() || '',
      manNonConId: ticket.manNonCon?.nonConId?.toString() || '',
      unitId: ticket.unit?.unitId?.toString() || '',
      sequenceId: ticket.sequence?.sequenceId?.toString() || '',
      drawingNum: ticket.drawingNum || '', // Text input
      description: ticket.description || '',
    });

    // Set Search/Display Terms
    setEditDivisionSearch(ticket.division?.divisionName || '');
    setEditWorkOrderSearch(ticket.wo?.wo || '');
    setEditLaborDeptText(ticket.laborDepartment?.departmentName || '');
    setEditManNonConText((ticket.manNonCon as any)?.nonCon || '');
    setEditUnitText(ticket.unit?.unitName || '');
    setEditSequenceText(ticket.sequence?.sequenceName || '');
    
    // Pre-fetch global lists immediately so they are populated
    fetchGlobalDropdownData('divisions', setDivisions);
    fetchGlobalDropdownData('work-orders', setWorkOrders);
  };

  // Prevent background scroll on modal
  useEffect(() => {
    document.body.style.overflow = isEditing ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isEditing]);

  const handleSaveEdit = async () => {
    if (!editingTicket) return;
    if (!userId) {
        toast({ variant: "destructive", title: "Authentication Error", description: "User could not be identified. Please log in again." });
        return;
    }
    
    // Validation (Matching FileForm logic)
    if (!editFields.divisionId) { toast({ variant: "destructive", title: "Validation Error", description: "'Division' field is empty." }); return; }
    if (!editFields.workOrderId) { toast({ variant: "destructive", title: "Validation Error", description: "'Work Order' field is empty." }); return; }
    if (!editFields.laborDeptId) { toast({ variant: "destructive", title: "Validation Error", description: "'Labor Department' field is empty." }); return; }
    if (!editFields.manNonConId) { toast({ variant: "destructive", title: "Validation Error", description: "'Manufacturing Nonconformance' field is empty." }); return; }
    if (!editFields.description) { toast({ variant: "destructive", title: "Validation Error", description: "Description is a required field." }); return; }

    try {
      const statusValue = editFields.status === "Closed" ? 1 : 0;

      const payload = {
        status: statusValue,
        description: editFields.description,
        drawingNum: editFields.drawingNum, // Text string
        initiator: userId, // Include initiator to be safe
        ...(editFields.divisionId && { division: parseInt(editFields.divisionId) }),
        ...(editFields.workOrderId && { wo: parseInt(editFields.workOrderId) }),
        ...(editFields.laborDeptId && { laborDepartment: parseInt(editFields.laborDeptId) }),
        ...(editFields.manNonConId && { manNonCon: parseInt(editFields.manNonConId) }),
        ...(editFields.unitId && { unit: parseInt(editFields.unitId) }),
        ...(editFields.sequenceId && { sequence: parseInt(editFields.sequenceId) }),
      };

      const response = await fetch(`http://localhost:3000/api/tickets/${editingTicket.ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let success = false;
      let responseData: any = null;
      try { responseData = await response.json(); } catch {}

      if (response.ok || response.status === 204 || (responseData && (responseData.ticketId || responseData.qualityTicketId))) {
        success = true;
      }

      if (!success) throw new Error(`Failed to update ticket. Status: ${response.status}`);

      toast({ title: "Success", description: `Ticket ${editingTicket.qualityTicketId} has been updated.` });
      fetchTickets();
      setIsEditing(false);
      setEditingTicket(null);
    } catch (err: any) {
      console.error("Update error:", err);
      toast({ variant: "destructive", title: "Update Failed", description: err.message });
    }
  };

  // Search Logic
  useEffect(() => {
    const timerId = setTimeout(() => handleSearch(searchTerm), 500);
    return () => clearTimeout(timerId);
  }, [searchTerm, tickets]);

  const handleSearch = async (currentSearchTerm: string) => {
    if (!currentSearchTerm) {
      setSearchResult(null);
      return;
    }

    if (/^\d+$/.test(currentSearchTerm)) {
      setIsSearching(true);
      try {
        const response = await fetch(`http://localhost:3000/api/tickets/${currentSearchTerm}`);
        if (response.ok) {
          const ticket = await response.json();
          setSearchResult([ticket]);
        } else if (response.status === 404) {
          setSearchResult([]);
        } else {
          throw new Error('Search failed');
        }
      } catch (e) {
        setSearchResult([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      const filtered = tickets.filter(ticket =>
        ticket.description?.toLowerCase().includes(currentSearchTerm.toLowerCase())
      );
      setSearchResult(filtered);
    }
  };

  // --- RENDER PREPARATION ---
  
  const displayedTickets = searchResult ?? tickets;

  // Group tickets by Work Order Number
  const ticketsByWO = displayedTickets.reduce((acc, ticket) => {
    const woNum = ticket.wo?.wo; 
    if (!woNum) return acc;
    if (!acc[woNum]) acc[woNum] = [];
    acc[woNum].push(ticket);
    return acc;
  }, {} as Record<string, Ticket[]>);

  const sortedWOs = Object.keys(ticketsByWO).sort();

  if (loading) return <div className="flex justify-center items-center p-4"><ScaleLoader color="#3b82f6" /> <span className="ml-2">Loading tickets...</span></div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div>
      {/* --- SEARCH BAR --- */}
      <div className="flex items-center gap-4 mb-6">
        <Input
          type="text"
          placeholder="Search by Ticket ID or Description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm bg-white"
        />
        {isSearching && <ScaleLoader color="#3b82f6" height={20} />}
      </div>

      <div className="space-y-4">
        {(displayedTickets.length === 0 && !loading) ? (
             <div className="text-center p-8 text-gray-500 bg-white rounded shadow-sm">
                {searchTerm ? 'No tickets found matching your search.' : 'No tickets found.'}
             </div>
        ) : (
        /* --- OUTER ACCORDION: WORK ORDERS --- */
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
                <Accordion type="single" collapsible className="w-full space-y-2">
                    {ticketsByWO[woNum].map((ticket) => {
                        const badgeStyle = ticket.status?.statusId === 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
                        return (
                        <AccordionItem 
                            id={`ticket-${ticket.ticketId}`}
                            key={ticket.ticketId} 
                            value={ticket.ticketId.toString()}
                            className="border border-gray-200 bg-white rounded-md"
                        >
                            <AccordionTrigger 
                                className="px-4 py-3 hover:bg-gray-50 hover:no-underline"
                                onClick={(e) => {
                                    const isClosing = (e.currentTarget.closest('[data-state]')?.getAttribute('data-state') === 'open');
                                    if (isClosing && lastScrollPosition !== null) {
                                        window.scrollTo({ top: lastScrollPosition, behavior: 'smooth' });
                                        setLastScrollPosition(null);
                                    } else {
                                        setLastScrollPosition(window.scrollY);
                                        setTimeout(() => {
                                            const el = document.getElementById(`ticket-${ticket.ticketId}`);
                                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }, 150);
                                    }
                                }}
                            >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full text-left pr-4 items-center">
                                <span className="font-bold text-blue-600">{ticket.qualityTicketId || ticket.ticketId}</span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${badgeStyle}`}>
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
                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 mb-6 border-b border-gray-100 pb-4">
                                 <Button
                                    variant="default"
                                    onClick={() => navigate(`/tickets/${ticket.ticketId}`)}
                                    className="flex-1 md:flex-none md:w-auto md:min-w-[120px]"
                                >
                                    View Details
                                </Button>
                                {userRole === 'admin' && (
                                    <>
                                        <Button variant="secondary" onClick={() => handleEdit(ticket.ticketId)} className="flex-1 md:flex-none md:w-auto md:min-w-[120px]">Edit Ticket</Button>
                                        <Button variant="destructive" onClick={() => confirmAndArchive(ticket.ticketId)} className="flex-1 md:flex-none md:w-auto md:min-w-[120px]">Archive Ticket</Button>
                                    </>
                                )}
                            </div>

                            {/* Full Ticket Details */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-3 space-y-2">
                                <h4 className="text-sm font-bold text-gray-900">Description</h4>
                                <div className="p-3 bg-gray-50 rounded border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap break-words">
                                    {ticket.description && ticket.description.length > 300
                                        ? (
                                            <>
                                                {`${ticket.description.substring(0, 300)}...`}
                                                <span className="block mt-2 text-xs text-gray-500 italic">
                                                    For the full description, tap "View Details".
                                                </span>
                                            </>
                                        )
                                        : (ticket.description || "No description provided.")
                                    }
                                </div>
                                </div>                                
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
                                {ticket.status?.statusId === 1 && (
                                <div className="space-y-3 bg-blue-50 p-3 rounded border border-blue-100">
                                    <h4 className="text-sm font-bold text-blue-900 border-b border-blue-200 pb-1">Resolution</h4>
                                    <DetailRow label="Closed Date" value={ticket.closeDate ? new Date(ticket.closeDate).toLocaleDateString() : 'N/A'} />
                                    <DetailRow label="Est. Hours Lost" value={ticket.estimatedLaborHours?.toString()} />
                                    <DetailRow label="Materials" value={ticket.materialsUsed} />
                                    <div className="pt-2 border-t border-blue-200 mt-2">
                                    <span className="text-blue-900 text-xs uppercase tracking-wider font-semibold block mb-1">Corrective Action</span>
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
        )}
      </div>

      {/* --- EDIT MODAL --- */}
      {isEditing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-3xl relative max-h-[90vh] overflow-y-auto">

        <button
            onClick={() => setIsEditing(false)}
            className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center bg-red-600 text-white text-2xl font-bold rounded-lg hover:bg-red-700"
        >
            ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">Edit Ticket {editingTicket?.qualityTicketId || ''} </h2>
        <p className="text-sm text-gray-500 italic mb-4">Fields marked with an asterisk (*) are required.</p>

        <div className="space-y-6">
            
            {/* Status Field (Admin only usually, but present in edit) */}
            <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
                value={editFields.status}
                onChange={(e) => setEditFields({ ...editFields, status: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
            </select>
            </div>

            {/* 1. Division Dropdown (Global) */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Division <span className="text-red-500">*</span></label>
                <input
                    list="edit-division-list"
                    value={editDivisionSearch}
                    onChange={(e) => {
                        setEditDivisionSearch(e.target.value);
                        const selected = divisions.find(d => d.divisionName === e.target.value);
                        setEditFields({ ...editFields, divisionId: selected ? String(selected.divisionId) : '' });
                    }}
                    onFocus={() => !editDivisionSearch && fetchGlobalDropdownData('divisions', setDivisions)}
                    placeholder="Search or select a division"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
                <datalist id="edit-division-list">
                    {divisions.map((d) => <option key={d.divisionId} value={d.divisionName} />)}
                </datalist>
            </div>

            {/* 2. Work Order Dropdown (Global) */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Work Order <span className="text-red-500">*</span></label>
                <input
                    list="edit-workorder-list"
                    value={editWorkOrderSearch}
                    onChange={(e) => {
                        setEditWorkOrderSearch(e.target.value);
                        const selected = workOrders.find(wo => String(wo.wo) === e.target.value);
                        setEditFields({ 
                            ...editFields, 
                            workOrderId: selected ? String(selected.woId) : '',
                            // Reset filtered dependent fields
                            laborDeptId: '',
                            manNonConId: '',
                            unitId: '',
                            sequenceId: ''
                        });
                        // Clear text displays for dependents
                        setEditLaborDeptText('');
                        setEditManNonConText('');
                        setEditUnitText('');
                        setEditSequenceText('');
                    }}
                    onFocus={() => !editWorkOrderSearch && fetchGlobalDropdownData('work-orders', setWorkOrders)}
                    placeholder="Search or select a work order"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
                <datalist id="edit-workorder-list">
                    {workOrders.map((wo) => <option key={wo.woId} value={wo.wo} />)}
                </datalist>
            </div>

            {/* 3. Labor Department (Filtered by WO) */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Labor Department <span className="text-red-500">*</span></label>
                <input
                    list="edit-labor-dept-list"
                    value={editLaborDeptText}
                    disabled={!editFields.workOrderId}
                    onChange={(e) => {
                        setEditLaborDeptText(e.target.value);
                        const selected = laborDepts.find(d => d.departmentName === e.target.value);
                        setEditFields({ ...editFields, laborDeptId: selected ? String(selected.departmentId) : '' });
                    }}
                    placeholder={editFields.workOrderId ? "Select a labor department" : "Select a Work Order first"}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 disabled:bg-gray-100"
                />
                <datalist id="edit-labor-dept-list">
                    {laborDepts.map((d) => <option key={d.departmentId} value={d.departmentName} />)}
                </datalist>
            </div>

            {/* 4. Manufacturing Nonconformance (Filtered by WO) */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Manufacturing Nonconformance <span className="text-red-500">*</span></label>
                <input
                    list="edit-noncon-list"
                    value={editManNonConText}
                    disabled={!editFields.workOrderId}
                    onChange={(e) => {
                        setEditManNonConText(e.target.value);
                        const selected = manNonCons.find(m => m.nonCon === e.target.value);
                        setEditFields({ ...editFields, manNonConId: selected ? String(selected.nonConId) : '' });
                    }}
                    placeholder={editFields.workOrderId ? "Select a nonconformance" : "Select a Work Order first"}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 disabled:bg-gray-100"
                />
                <datalist id="edit-noncon-list">
                    {manNonCons.map((m) => <option key={m.nonConId} value={m.nonCon} />)}
                </datalist>
            </div>

            {/* 5. Unit (Filtered by WO) */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <input
                    list="edit-unit-list"
                    value={editUnitText}
                    disabled={!editFields.workOrderId}
                    onChange={(e) => {
                        setEditUnitText(e.target.value);
                        const selected = units.find(u => u.unitName === e.target.value);
                        setEditFields({ ...editFields, unitId: selected ? String(selected.unitId) : '' });
                    }}
                    placeholder={editFields.workOrderId ? "Select a unit" : "Select a Work Order first"}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 disabled:bg-gray-100"
                />
                <datalist id="edit-unit-list">
                    {units.map((u) => <option key={u.unitId} value={u.unitName} />)}
                </datalist>
            </div>

            {/* 6. Sequence (Filtered by WO) */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Sequence</label>
                <input
                    list="edit-sequence-list"
                    value={editSequenceText}
                    disabled={!editFields.workOrderId}
                    onChange={(e) => {
                        setEditSequenceText(e.target.value);
                        const selected = sequences.find(s => s.sequenceName === e.target.value);
                        setEditFields({ ...editFields, sequenceId: selected ? String(selected.sequenceId) : '' });
                    }}
                    placeholder={editFields.workOrderId ? "Select a sequence" : "Select a Work Order first"}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 disabled:bg-gray-100"
                />
                <datalist id="edit-sequence-list">
                    {sequences.map((s) => <option key={s.sequenceId} value={s.sequenceName} />)}
                </datalist>
            </div>

            {/* 7. Drawing Number (Manual Text Input) */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Drawing #</label>
                <input
                    type="text"
                    value={editFields.drawingNum}
                    onChange={(e) => setEditFields({ ...editFields, drawingNum: e.target.value })}
                    placeholder="Enter drawing number"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
            </div>

            {/* 8. Description */}
            <div>
            <label className="block text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
            <textarea
                value={editFields.description}
                onChange={(e) => setEditFields({ ...editFields, description: e.target.value })}
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
            </div>
            
             <div className="grid grid-cols-[1fr_3fr] items-center gap-4">
                <span className="text-right font-semibold">Attachments</span>
                <span className="text-gray-500 italic">Attachment display not yet implemented.</span>
            </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-6">
            <button
            onClick={() => setShowSubmitConfirm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
            Save
            </button>
        </div>
        {showSubmitConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-2">Ready to submit?</h3>
                        <p className="text-sm text-gray-700 mb-4">Are you sure you want to submit these changes? You can cancel to continue editing.</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowSubmitConfirm(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    setShowSubmitConfirm(false);
                                    await handleSaveEdit();
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
    )}

      {/* --- ARCHIVE CONFIRMATION MODAL --- */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold mb-2">Archive Ticket</h3>
                <p className="text-sm text-gray-700 mb-4">
                    Are you sure you want to archive this ticket? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={() => {
                            setShowArchiveConfirm(false);
                            setTicketToArchive(null);
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (ticketToArchive) {
                                handleArchive(ticketToArchive);
                                setShowArchiveConfirm(false);
                                setTicketToArchive(null);
                            }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Archive
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default TicketList;