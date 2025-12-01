import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useToast } from "../../hooks/use-toast";
import ScaleLoader from "react-spinners/ScaleLoader";
import { Textarea } from "../../components/ui/textarea";
import AssignUser from "../../components/AssignUser";
import { isEditable, requiresAssignedUser } from "../../lib/ticketRules";
import type { 
  Ticket as TicketType, 
  User, 
  Division, 
  Status, 
  WorkOrder, 
  Unit, 
  Sequence, 
  Nonconformance 
} from "../../types";
//import FileList from "../../components/FileList"; commented out temporarily to make react compile

interface Note {
  noteId: number;
  text: string;
  createdAt: string;
  author: {
    userId: number;
    name: string;
  };
}

interface TicketDetailsTicket {
  ticketId: number;
  qualityTicketId?: string;
  description: string;
  openDate: string;
  
  // Use global types to prevent "incompatible type" errors
  status: Status;
  initiator: User;
  division?: Division; 
  wo?: WorkOrder;
  unit?: Unit;
  sequence?: Sequence;
  manNonCon?: Nonconformance;
  
  // These fields might not have global types yet, so keep them as is or update if needed
  partNum?: { partNum: string };
  drawingNum?: string;
  
  // Ensure this matches the User type (id and name)
  assignedTo?: User | null; 
}

const TicketDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [ticket, setTicket] = useState<TicketDetailsTicket | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState("");
  const [status, setStatus] = useState("0"); // Default to 'Open' (0)

  // Load Ticket Info
  const fetchTicket = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/tickets/${id}`);
      const data: TicketDetailsTicket = await response.json();
      setTicket(data);
      setStatus(data.status?.statusId?.toString() || "0");
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load ticket.",
      });
    }
  };

  // Load Notes
  const fetchNotes = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/tickets/${id}/notes`);
      const data = await response.json();
      setNotes(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchTicket();
      await fetchNotes();
      setLoading(false);
    };
    load();
  }, [id]);

  // Add Note
  const handleAddNote = async () => {
    if (!noteText.trim()) {
      return toast({
        variant: "destructive",
        title: "Note Required",
        description: "Cannot submit an empty note.",
      });
    }

    try {
      await fetch(`http://localhost:3000/api/tickets/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteText }),
      });

      setNoteText("");
      fetchNotes();
      toast({ title: "Success", description: "Note added." });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add note.",
      });
    }
  };

  // Update Status
  const handleStatusUpdate = async () => {
    try {
      await fetch(`http://localhost:3000/api/tickets/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: parseInt(status) }),
      });

      toast({ title: "Success", description: "Status updated." });
      fetchTicket();
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status.",
      });
    }
  };

  if (loading || !ticket) {
    return (
      <div className="flex justify-center mt-10">
        <ScaleLoader color="#3b82f6" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-6 space-y-6">

      {/* Back Button */}
      <Button variant="outline" onClick={() => navigate(-1)}>
        ← Back
      </Button>

      {/* Ticket Info */}
      <Card>
        <CardHeader>
          <CardTitle>Ticket {ticket.qualityTicketId || `#${ticket.ticketId}`}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          <p><b>Status:</b> {ticket.status?.statusDescription}</p>
          <p><b>Description:</b> {ticket.description}</p>
          <p><b>Work Order:</b> {ticket.wo?.wo}</p>
          <p><b>Division:</b> {ticket.division?.divisionName}</p>
          <p><b>Part #:</b> {ticket.partNum?.partNum}</p>
          <p><b>Drawing #:</b> {ticket.drawingNum}</p>
          <p><b>Unit:</b> {ticket.unit?.unitName}</p>
          <p><b>Sequence:</b> {ticket.sequence?.sequenceName}</p>
          <p><b>Nonconformance:</b> {ticket.manNonCon?.nonCon}</p>
          <p><b>Opened:</b> {new Date(ticket.openDate).toLocaleString()}</p>
          <p><b>Initiator:</b> {ticket.initiator?.name}</p>
        </CardContent>
      </Card>
      
      {/* Assignment */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment</CardTitle>
        </CardHeader>
      
      <CardContent className="space-y-3">
      
        {requiresAssignedUser(ticket) && (
          <p className="text-red-600">
            This ticket is In Progress but has no assigned user.
          </p>
      )}
      
      <AssignUser
        ticketId={ticket.ticketId}
        currentAssigned={ticket.initiator?.name}
      />
      
      </CardContent>
    </Card>
      
      {/* Files */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Files</CardTitle>
        </CardHeader>

        <CardContent>
          {/* <FileList /> */}
        </CardContent>
      </Card>

      {/* Status Update */}
      <Card>
        <CardHeader>
          <CardTitle>Update Status</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <select
            className="border rounded p-2 w-full"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="0">Open</option>
            <option value="1">In Progress</option>
            <option value="2">Closed</option>
          </select>

          <Button onClick={handleStatusUpdate}>Update Status</Button>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          {/* Existing Notes */}
          <div className="space-y-2 max-h-60 overflow-auto border rounded p-2 bg-gray-50">
            {notes.length > 0 ? (
              notes.map((note) => (
                <div key={note.noteId} className="p-2 bg-white rounded shadow-sm">
                  <p>{note.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    – {note.author?.name} ({new Date(note.createdAt).toLocaleString()})
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No notes yet.</p>
            )}
          </div>

          {/* Add Note */}
          <Textarea
            placeholder="Add a note..."
            value={noteText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                setNoteText(e.target.value)}
          />

          <Button onClick={handleAddNote}>Add Note</Button>
        </CardContent>
      </Card>

    </div>
  );
};

export default TicketDetails;
