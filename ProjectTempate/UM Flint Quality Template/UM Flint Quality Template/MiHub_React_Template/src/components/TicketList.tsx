import React, { useState, useEffect } from 'react';
import ScaleLoader from "react-spinners/ScaleLoader";
import { useAuth } from './AuthContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '../hooks/use-toast';
import { useIsMobile } from '../hooks/use-mobile';
   
const TicketList: React.FC = () => {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const { userRole } = useAuth();
    const [searchResult, setSearchResult] = useState<any[] | null>(null);
    const { toast } = useToast();
    const isMobile = useIsMobile();
    // Track the last scroll position to restore it when closing tickets
    const [lastScrollPosition, setLastScrollPosition] = useState<number | null>(null);

    // Dropdown data 
    const [divisions, setDivisions] = useState<any[]>([]);
    const [parts, setParts] = useState<any[]>([]);
    const [drawings, setDrawings] = useState<any[]>([]);
    const [workOrders, setWorkOrders] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);
    const [sequences, setSequences] = useState<any[]>([]);
    const [manNonCons, setManNonCons] = useState<any[]>([]);

    //editing state
    const [isEditing, setIsEditing] = useState(false);
    const [editingTicket, setEditingTicket] = useState<any | null>(null);
    //fields
    const [editFields, setEditFields] = useState({
    status: '',
    divisionId: '',
    partNumId: '',
    drawingId: '',
    workOrderId: '',
    unitId: '',
    sequenceId: '',
    manNonConId: '',
    description: '',
    });


    const fetchTickets = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('http://localhost:3000/api/tickets', {
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                });
                if (!response.ok) {
                    throw new Error(`Network response was not ok, status: ${response.status}`);
                }
                const data = await response.json();
                setTickets(data);
            } catch (err) {
                setError("Failed to fetch tickets. Please try again later.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        
    useEffect(() => {
        fetchTickets();
    }, []);

    // Set consistent scroll margins for all tickets
    useEffect(() => {
        const setTicketMargins = () => {
            // Get the header height to calculate proper margin
            const header = document.querySelector('nav, header, .navbar') || document.querySelector('[class*="bg-muted"]');
            let headerHeight = header ? header.getBoundingClientRect().height : 0;
            
            // Add some padding to the header height
            const paddingTop = isMobile ? 10 : 20;
            const marginTop = headerHeight + paddingTop;

            const tickets = document.querySelectorAll('[id^="ticket-"]');
            tickets.forEach(ticket => {
                if (ticket instanceof HTMLElement) {
                    ticket.style.scrollMarginTop = `${marginTop}px`;
                }
            });
        };

        // Set initial margins
        setTicketMargins();

        // Update margins when tickets are loaded or changed
        const observer = new MutationObserver(setTicketMargins);
        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });

        // Also update on window resize to handle layout changes
        window.addEventListener('resize', setTicketMargins);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', setTicketMargins);
        };
    }, [isMobile]);

    //Fetch dropdown data
    useEffect(() => {
    const fetchData = async () => {
        try {
            const [divisionRes, partRes, drawingRes, woRes, unitRes, seqRes, manNonConRes] = await Promise.all([
                fetch('http://localhost:3000/api/divisions'),
                fetch('http://localhost:3000/api/parts'),
                fetch('http://localhost:3000/api/drawings'),
                fetch('http://localhost:3000/api/work-orders'),
                fetch('http://localhost:3000/api/units'),
                fetch('http://localhost:3000/api/sequences'),
                fetch('http://localhost:3000/api/manufact-noncons'),
            ]);

            setDivisions(await divisionRes.json());
            setParts(await partRes.json());
            setDrawings(await drawingRes.json());
            setWorkOrders(await woRes.json());
            setUnits(await unitRes.json());
            setSequences(await seqRes.json());
            setManNonCons(await manNonConRes.json());
        } catch (error) {
            console.error("Failed to fetch dropdown data:", error);
        }
    };
    fetchData();
    }, []);

    const handleArchive = async (ticketId: number) => {
        try {
            const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                // If the server sends a JSON error, use it. Otherwise, use a generic message.
                let errorMessage = `Failed to archive ticket. Status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // Ignore if response is not JSON
                }
                throw new Error(errorMessage);
            }

            toast({
                title: "Success",
                description: `Ticket #${ticketId} has been archived.`,
            });

            // Refresh the ticket list after archiving
            fetchTickets();

        } catch (err: any) {
            console.error("Archive error:", err);
            toast({
                variant: "destructive",
                title: "Archive Failed",
                description: err.message || "An unexpected error occurred.",
            });
        }
    };

    //Edit function for button
    const handleEdit = (ticketId: number) => {
    const ticket = tickets.find((t) => t.ticketId === ticketId);
    setEditingTicket(ticket);
    setIsEditing(true);

    setEditFields({
        status: ticket.status?.statusDescription || '',
        divisionId: ticket.division?.divisionId?.toString() || '',
        partNumId: ticket.partNum?.partNumId?.toString() || '',
        drawingId: ticket.drawingNum?.drawingId?.toString() || '',
        workOrderId: ticket.wo?.woId?.toString() || '',
        unitId: ticket.unit?.unitId?.toString() || '',
        sequenceId: ticket.sequence?.seqID?.toString() || '',
        manNonConId: ticket.manNonCon?.nonConId?.toString() || '',
        description: ticket.description || '',
    });
    };

    // Prevent background scrolling while the edit modal is open
    useEffect(() => {
        if (isEditing) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isEditing]);

const handleSaveEdit = async () => {
    if (!editingTicket) return;

    try {
        const statusValue =
            editFields.status === "Closed" ? 1 : 0; // mirror create flow

        const payload = {
            status: statusValue,
            description: editFields.description,
            ...(editFields.divisionId && { division: parseInt(editFields.divisionId) }),
            ...(editFields.partNumId && { partNum: parseInt(editFields.partNumId) }),
            ...(editFields.drawingId && { drawingNum: parseInt(editFields.drawingId) }),
            ...(editFields.workOrderId && { wo: parseInt(editFields.workOrderId) }),
            ...(editFields.unitId && { unit: parseInt(editFields.unitId) }),
            ...(editFields.sequenceId && { sequence: parseInt(editFields.sequenceId) }),
            ...(editFields.manNonConId && { manNonCon: parseInt(editFields.manNonConId) }),
        };

        const response = await fetch(
            `http://localhost:3000/api/tickets/${editingTicket.ticketId}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }
        );

        // Sometimes backend returns 500 even when the action succeeds
        let success = false;
        let responseData: any = null;

        try {
            responseData = await response.json();
        } catch {
            // ignore if no JSON body
        }

        if (response.ok || response.status === 204 || (responseData && responseData.ticketId)) {
            success = true;
        }

        if (!success) {
            throw new Error(
                `Failed to update ticket. Status: ${response.status}`
            );
        }

        toast({
            title: "Success",
            description: `Ticket #${editingTicket.ticketId} has been updated.`,
        });

        fetchTickets();
        setIsEditing(false);
        setEditingTicket(null);
    } catch (err: any) {
        console.error("Update error:", err);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: err.message || "An unexpected error occurred.",
        });
    }
};



    const confirmAndArchive = (ticketId: number) => {
        const isConfirmed = window.confirm(`Are you sure you want to archive Ticket #${ticketId}? This action cannot be undone.`);
        if (isConfirmed) {
            handleArchive(ticketId);
        }
    };

    // Effect to handle debouncing the search term
    useEffect(() => {
        const timerId = setTimeout(() => {
            // This is where the actual search will be triggered, but we'll do it in another effect
            handleSearch(searchTerm);
        }, 500); // Wait for 500ms after the user stops typing

        return () => {
            clearTimeout(timerId);
        };
    }, [searchTerm, tickets]); // Rerun when searchTerm or the base ticket list changes

    const handleSearch = async (currentSearchTerm: string) => {
        if (!currentSearchTerm) {
            setSearchResult(null); // Clear search results when input is empty
            return;
        }

        // If search term is a number, try to fetch by ID
        if (/^\d+$/.test(currentSearchTerm)) {
            setIsSearching(true);
            try {
                const response = await fetch(`http://localhost:3000/api/tickets/${currentSearchTerm}`);
                if (response.ok) {
                    const ticket = await response.json();
                    setSearchResult([ticket]); // Display only the found ticket
                } else if (response.status === 404) {
                    setSearchResult([]); // No ticket found
                } else {
                    throw new Error('Search failed');
                }
            } catch (e) {
                setSearchResult([]); // Handle error case
            } finally {
                setIsSearching(false);
            }
        } else {
            // If not a number, perform client-side filtering
            const filtered = tickets.filter(ticket =>
                ticket.description?.toLowerCase().includes(currentSearchTerm.toLowerCase())
            );
            setSearchResult(filtered);
        }
    };

    if (loading) return <div className="flex justify-center items-center p-4"><ScaleLoader color="#3b82f6" /> <span className="ml-2">Loading tickets...</span></div>;
    if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

    return (
        <div>
            <div className="flex items-center gap-4 mb-4">
                <Input
                    type="text"
                    placeholder="Search by Ticket ID or Description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                {isSearching && <ScaleLoader color="#3b82f6" height={20} />}
            </div>
            <div className="space-y-4">
                {isSearching ? (
                    <div className="text-center p-4 text-gray-500">Searching...</div>
                ) : (searchResult ?? tickets).length > 0 ? (
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {(searchResult ?? tickets).map((ticket) => (
                            <AccordionItem id={`ticket-${ticket.ticketId}`} value={`item-${ticket.ticketId}`} key={ticket.ticketId} className="border rounded-md shadow-sm bg-gray-50 data-[state=open]:bg-white">
                                <AccordionTrigger
                                    className="p-4 hover:no-underline hover:bg-gray-100 rounded-t-md data-[state=open]:rounded-b-none data-[state=open]:border-b overflow-hidden"
                                    onClick={(e) => {
                                        // Get current value state from the accordion item's data-state
                                        const isClosing = (e.currentTarget.closest('[data-state]')?.getAttribute('data-state') === 'open');
                                        
                                        if (isClosing) {
                                            // Restore previous scroll position when closing
                                            if (lastScrollPosition !== null) {
                                                window.scrollTo({ top: lastScrollPosition, behavior: 'smooth' });
                                                setLastScrollPosition(null);
                                            }
                                        } else {
                                            // Save current scroll position and scroll to opened ticket
                                            setLastScrollPosition(window.scrollY);
                                            setTimeout(() => {
                                                const el = document.getElementById(`ticket-${ticket.ticketId}`);
                                                if (el) {
                                                    el.scrollIntoView({ 
                                                        behavior: 'smooth', 
                                                        block: 'start'
                                                    });
                                                }
                                            }, 150);
                                        }
                                    }}
                                >
                                    <div className="flex-1 text-left min-w-0">
                                        <h3 className="font-bold text-lg">Ticket #{ticket.ticketId}</h3>
                                        <p><span className="font-semibold">Status:</span> {ticket.status?.statusDescription || 'N/A'}</p>
                                        <p><span className="font-semibold">Description:</span> {ticket.description || 'N/A'}</p>
                                        <p><span className="font-semibold">Initiator:</span> {ticket.initiator?.name || ticket.initiator?.username || 'N/A'}</p>
                                        <p className="text-sm text-gray-500 mt-2">Opened: {new Date(ticket.openDate).toLocaleString()}</p>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-4">
                                    <div className="space-y-4 py-4 text-sm">
                                        <div className="grid grid-cols-[1fr_3fr] items-center gap-4">
                                            <span className="text-right font-semibold">Status</span>
                                            <span>{ticket.status?.statusDescription || 'N/A'}</span>
                                        </div>
                                        <div className="grid grid-cols-[1fr_3fr] items-start gap-4">
                                            <span className="text-right font-semibold">Description</span>
                                            <p className="break-words min-w-0">{ticket.description || 'N/A'}</p>
                                        </div>
                                        <div className="grid grid-cols-[1fr_3fr] items-center gap-4">
                                            <span className="text-right font-semibold">Initiator</span>
                                            <span>{ticket.initiator?.name || ticket.initiator?.username || 'N/A'}</span>
                                        </div>
                                        <div className="grid grid-cols-[1fr_3fr] items-center gap-4">
                                            <span className="text-right font-semibold">Division</span>
                                            <span>{ticket.division?.divisionName || 'N/A'}</span>
                                        </div>
                                        <div className="grid grid-cols-[1fr_3fr] items-center gap-4">
                                            <span className="text-right font-semibold">Part #</span>
                                            <span>{ticket.partNum?.partNum || 'N/A'}</span>
                                        </div>
                                        <div className="grid grid-cols-[1fr_3fr] items-center gap-4">
                                            <span className="text-right font-semibold">Drawing #</span>
                                            <span>{ticket.drawingNum?.drawing_num || 'N/A'}</span>
                                        </div>
                                        <div className="grid grid-cols-[1fr_3fr] items-center gap-4">
                                            <span className="text-right font-semibold">Work Order</span>
                                            <span>{ticket.wo?.wo || 'N/A'}</span>
                                        </div>
                                        <div className="grid grid-cols-[1fr_3fr] items-center gap-4">
                                            <span className="text-right font-semibold">Unit</span>
                                            <span>{ticket.unit?.unitName || 'N/A'}</span>
                                        </div>
                                        <div className="grid grid-cols-[1fr_3fr] items-center gap-4">
                                            <span className="text-right font-semibold">Sequence</span>
                                            <span>{ticket.sequence?.seqName || 'N/A'}</span>
                                        </div>
                                        <div className="grid grid-cols-[1fr_3fr] items-center gap-4">
                                            <span className="text-right font-semibold">Nonconformance</span>
                                            <span className="break-words min-w-0">{ticket.manNonCon?.nonCon || 'N/A'}</span>
                                        </div>
                                        <div className="grid grid-cols-[1fr_3fr] items-center gap-4">
                                            <span className="text-right font-semibold">Attachments</span>
                                            <span className="text-gray-500 italic">Attachment display not yet implemented.</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between mt-4">
    {userRole === 'admin' && (
    <Button
        variant="default"onClick={() => handleEdit(ticket.ticketId)}>
        Edit Ticket
    </Button>
    )}
    {userRole === 'admin' && (
        <Button
            variant="destructive"onClick={() => confirmAndArchive(ticket.ticketId)}>
            Archive Ticket
        </Button>
    )}
</div>

                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <p>{searchTerm ? 'No tickets found matching your search.' : 'No tickets available.'}</p>
                )
            }
            </div>
            {isEditing && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg w-full max-w-3xl relative max-h-[90vh] overflow-y-auto shadow-lg">

      {/* Close (X) Button */}
      <button
        onClick={() => setIsEditing(false)}
        className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center bg-red-600 text-white text-2xl font-bold rounded-lg hover:bg-red-700"
             >
          ✕
      </button>

      {/* Title */}
      <h2 className="text-xl font-semibold mb-4">Edit Ticket #{editingTicket?.ticketId || ''} </h2>

      {/* --- Form Fields --- */}
      <div className="space-y-4">
        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={editFields.status}
            onChange={(e) => setEditFields({ ...editFields, status: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            {/*<option value="">Select Status</option>*/}
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {/* Division */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Division</label>
          <select
            value={editFields.divisionId}
            onChange={(e) => setEditFields({ ...editFields, divisionId: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="">Select Division</option>
            {divisions.map((d) => (
              <option key={d.divisionId} value={d.divisionId}>{d.divisionName}</option>
            ))}
          </select>
        </div>

        {/* Part # */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Part #</label>
          <select
            value={editFields.partNumId}
            onChange={(e) => setEditFields({ ...editFields, partNumId: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="">Select Part</option>
            {parts.map((p) => (
              <option key={p.partNumId} value={p.partNumId}>{p.partNum}</option>
            ))}
          </select>
        </div>

        {/* Drawing # */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Drawing #</label>
          <select
            value={editFields.drawingId}
            onChange={(e) => setEditFields({ ...editFields, drawingId: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="">Select Drawing</option>
            {drawings.map((d) => (
              <option key={d.drawingId} value={d.drawingId}>{d.drawing_num}</option>
            ))}
          </select>
        </div>

        {/* Work Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Work Order</label>
          <select
            value={editFields.workOrderId}
            onChange={(e) => setEditFields({ ...editFields, workOrderId: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="">Select Work Order</option>
            {workOrders.map((wo) => (
              <option key={wo.woId} value={wo.woId}>{wo.wo}</option>
            ))}
          </select>
        </div>

        {/* Unit */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Unit</label>
          <select
            value={editFields.unitId}
            onChange={(e) => setEditFields({ ...editFields, unitId: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="">Select Unit</option>
            {units.map((u) => (
              <option key={u.unitId} value={u.unitId}>{u.unitName}</option>
            ))}
          </select>
        </div>

        {/* Sequence */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Sequence</label>
          <select
            value={editFields.sequenceId}
            onChange={(e) => setEditFields({ ...editFields, sequenceId: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="">Select Sequence</option>
            {sequences.map((s) => (
              <option key={s.seqID} value={s.seqID}>{s.seqName}</option>
            ))}
          </select>
        </div>

        {/* Nonconformance */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Nonconformance</label>
          <select
            value={editFields.manNonConId}
            onChange={(e) => setEditFields({ ...editFields, manNonConId: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="">Select Nonconformance</option>
            {manNonCons.map((m) => (
              <option key={m.nonConId} value={m.nonConId}>{m.nonCon}</option>
            ))}
          </select>
        </div>
         <div className="grid grid-cols-[1fr_3fr] items-center gap-4">
            <span className="text-right font-semibold">Attachments</span>
             <span className="text-gray-500 italic">Attachment display not yet implemented.</span>
         </div>
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={editFields.description}
            onChange={(e) => setEditFields({ ...editFields, description: e.target.value })}
            rows={4}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSaveEdit}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}


        </div>
    );
};

export default TicketList;