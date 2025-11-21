import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useToast } from "../../hooks/use-toast";
import ScaleLoader from "react-spinners/ScaleLoader";
import { Textarea } from "../../components/ui/textarea";




interface Note {
  noteId: number;
  text: string;
  createdAt: string;
  author: {
    userId: number;
    name: string;
  };
}

interface Ticket {
  ticketId: number;
  description: string;
  openDate: string;
  status: { statusDescription: string };
  initiator: { name: string };

  division?: { divisionName: string };
  partNum?: { partNum: string };
  drawingNum?: { drawing_num: string };
  wo?: { wo: string };
  unit?: { unitName: string };
  sequence?: { seqName: string };
  manNonCon?: { nonCon: string };
}

const TicketDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState("");
  const [status, setStatus] = useState("");

  // Load Ticket Info
  const fetchTicket = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/tickets/${id}`);
      const data = await response.json();
      setTicket(data);
      setStatus(data.status?.statusDescription || "Open");
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
        body: JSON.stringify({ status }),
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
          <CardTitle>Ticket #{ticket.ticketId}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          <p><b>Status:</b> {ticket.status?.statusDescription}</p>
          <p><b>Description:</b> {ticket.description}</p>
          <p><b>Work Order:</b> {ticket.wo?.wo}</p>
          <p><b>Division:</b> {ticket.division?.divisionName}</p>
          <p><b>Part #:</b> {ticket.partNum?.partNum}</p>
          <p><b>Drawing #:</b> {ticket.drawingNum?.drawing_num}</p>
          <p><b>Unit:</b> {ticket.unit?.unitName}</p>
          <p><b>Sequence:</b> {ticket.sequence?.seqName}</p>
          <p><b>Nonconformance:</b> {ticket.manNonCon?.nonCon}</p>
          <p><b>Opened:</b> {new Date(ticket.openDate).toLocaleString()}</p>
          <p><b>Initiator:</b> {ticket.initiator?.name}</p>
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
            <option>Open</option>
            <option>In Progress</option>
            <option>Closed</option>
            <option>Archived</option>
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
