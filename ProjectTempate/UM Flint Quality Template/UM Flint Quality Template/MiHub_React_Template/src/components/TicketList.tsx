import React, { useState, useEffect } from 'react';
import ScaleLoader from "react-spinners/ScaleLoader";
import { useAuth } from './AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '../hooks/use-toast';

const TicketList: React.FC = () => {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { userRole } = useAuth();
    const { toast } = useToast();

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

    const confirmAndArchive = (ticketId: number) => {
        const isConfirmed = window.confirm(`Are you sure you want to archive Ticket #${ticketId}? This action cannot be undone.`);
        if (isConfirmed) {
            handleArchive(ticketId);
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        const term = searchTerm.toLowerCase();
        const description = ticket.description?.toLowerCase() || '';
        const ticketId = ticket.ticketId.toString();
        return description.includes(term) || ticketId.includes(term);
    });

    if (loading) return <div className="flex justify-center items-center p-4"><ScaleLoader color="#3b82f6" /> <span className="ml-2">Loading tickets...</span></div>;
    if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

    return (
        <div>
            <div className="mb-4">
                <Input
                    type="text"
                    placeholder="Search by Ticket ID or Description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>
            <div className="space-y-4">
                {filteredTickets.length > 0 ? (
                    filteredTickets.map((ticket) => (
                        <Dialog key={ticket.ticketId}>
                            <DialogTrigger asChild>
                                <div className="p-4 border rounded-md shadow-sm bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                                    <h3 className="font-bold text-lg">Ticket #{ticket.ticketId}</h3>
                                    <p><span className="font-semibold">Status:</span> {ticket.status?.statusDescription || 'N/A'}</p>
                                    <p className="truncate"><span className="font-semibold">Description:</span> {ticket.description || 'N/A'}</p>
                                    <p><span className="font-semibold">Initiator:</span> {ticket.initiator?.name || ticket.initiator?.username || 'N/A'}</p>
                                    <p className="text-sm text-gray-500 mt-2">Opened: {new Date(ticket.openDate).toLocaleString()}</p>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Ticket #{ticket.ticketId} - Read Only</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4 text-sm">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <span className="text-right font-semibold">Status</span>
                                        <span className="col-span-3">{ticket.status?.statusDescription || 'N/A'}</span>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <span className="text-right font-semibold">Description</span>
                                        <p className="col-span-3 whitespace-pre-wrap">{ticket.description || 'N/A'}</p>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <span className="text-right font-semibold">Initiator</span>
                                        <span className="col-span-3">{ticket.initiator?.name || ticket.initiator?.username || 'N/A'}</span>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <span className="text-right font-semibold">Division</span>
                                        <span className="col-span-3">{ticket.division?.divisionName || 'N/A'}</span>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <span className="text-right font-semibold">Attachments</span>
                                        <span className="col-span-3 text-gray-500 italic">Attachment display not yet implemented.</span>
                                    </div>
                                </div>
                                <DialogFooter className="sm:justify-between">
                                    {userRole === 'admin' && (
                                        <Button variant="destructive" onClick={() => confirmAndArchive(ticket.ticketId)}>
                                            Archive Ticket
                                        </Button>
                                    )}
                                    <DialogClose asChild>
                                        <Button variant="outline">Close</Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    ))
                ) : (
                    <p>No tickets found matching your search.</p>
                )
            }
            </div>
        </div>
    );
};

export default TicketList;