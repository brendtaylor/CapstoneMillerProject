import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useToast } from "../../hooks/use-toast";
import ScaleLoader from "react-spinners/ScaleLoader";
import { Textarea } from "../../components/ui/textarea";
import AssignUser from "../../components/AssignUser";
import { isEditable, requiresAssignedUser } from "../../lib/ticketRules";
import type { Ticket } from "../../types";
//import { Ticket } from "lucide-react";
import FileDownload from "../../components/FileDownload"
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

const TicketDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState("");
  const [status, setStatus] = useState("0"); // Default to 'Open' (0)
  const [previousStatus, setPreviousStatus] = useState("0"); // Track the last confirmed status
  const [showAssignmentPrompt, setShowAssignmentPrompt] = useState(false);
  const [showClosingPrompt, setShowClosingPrompt] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{ status: number; extraFields?: object } | null>(null);
  const [closingFields, setClosingFields] = useState({
    correctiveAction: "",
    materialsUsed: "",
    estimatedLaborHours: "",
  });
  const resetToPreviousStatus = () => setStatus(previousStatus);

  // Load Ticket Info
  const fetchTicket = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/tickets/${id}`);
      const data: Ticket = await response.json();
      setTicket(data);
      const currentStatus = data.status?.statusId?.toString() || "0";
      setStatus(currentStatus);
      setPreviousStatus(currentStatus);
      // Pre-fill closing fields if they already exist
      setClosingFields({
        correctiveAction: data.correctiveAction || "",
        materialsUsed: data.materialsUsed || "",
        estimatedLaborHours: data.estimatedLaborHours?.toString() || "",
      });
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

  // Update Status (can be called directly or after assignment)
  const performStatusUpdate = async (statusToUpdate: number, extraFields?: object) => {
    try {
      await fetch(`http://localhost:3000/api/tickets/${id}`, { // change back to api/tickets/status later
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusToUpdate, ...extraFields }),
      });

      toast({ title: "Success", description: "Status updated." });
      fetchTicket();
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status.",
      });
    } finally {
      setPendingStatusUpdate(null);
    }
  };

  const handleStatusUpdate = async (newStatus?: string, extraFields?: object, options?: { skipConfirmation?: boolean }) => {
    const newStatusId = parseInt(status, 10);
    const statusToUpdate = newStatus ? parseInt(newStatus, 10) : newStatusId;
    const skipConfirmation = options?.skipConfirmation;

    if (statusToUpdate === 1 && !skipConfirmation) {
      setPendingStatusUpdate({ status: statusToUpdate, extraFields });
      setShowStatusConfirm(true);
      return;
    }

    performStatusUpdate(statusToUpdate, extraFields);
  };

  // Handle status dropdown change
  const handleStatusChange = (newStatusValue: string) => {
    // Remember what the status was before the user initiated the change
    setPreviousStatus(status);
    const newStatusId = parseInt(newStatusValue, 10);
    setStatus(newStatusValue);

    // If new status is "In Progress" (ID 1) and no user is assigned, show the prompt.
    if (newStatusId === 1 && !ticket?.assignedTo) {
      setShowAssignmentPrompt(true);
    } else if (newStatusId === 2) { // If new status is "Closed" (ID 2), show closing prompt.
      setShowClosingPrompt(true);
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
    <>
      {/* Assignment Prompt Overlay */}
      {showAssignmentPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Assignment Required</h3>
            <p className="text-sm text-gray-600 mb-4">
              To set this ticket to 'In Progress', you must first assign it to a user.
            </p>
            <AssignUser
              ticketId={ticket.ticketId}
              currentAssigned={ticket.assignedTo?.name}
              onAssignmentSuccess={() => {
                setShowAssignmentPrompt(false); // Close overlay
                fetchTicket(); // Refresh ticket to get new assignee
                handleStatusUpdate("1", undefined, { skipConfirmation: true }); // Now update status to "In Progress" without extra confirm
              }}
            />
            <Button
              variant="outline"
              className="w-full mt-3"
              onClick={() => {
                setShowAssignmentPrompt(false);
                resetToPreviousStatus();
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Closing Fields Prompt Overlay */}
      {showClosingPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-2">Close Ticket</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide the following details to close the ticket.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Corrective Action <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={closingFields.correctiveAction}
                  onChange={(e) => setClosingFields({ ...closingFields, correctiveAction: e.target.value })}
                  placeholder="Describe the corrective action taken..."
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Materials Used <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={closingFields.materialsUsed}
                  onChange={(e) => setClosingFields({ ...closingFields, materialsUsed: e.target.value })}
                  placeholder="List any materials used..."
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Estimated Labor Hours <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={closingFields.estimatedLaborHours}
                  onChange={(e) => setClosingFields({ ...closingFields, estimatedLaborHours: e.target.value })}
                  className="border rounded p-2 w-full"
                  placeholder="e.g., 2.5"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowClosingPrompt(false);
                  resetToPreviousStatus();
                }}
              >
                Cancel
              </Button>
              <Button onClick={() => {
                if (!closingFields.correctiveAction.trim() || !closingFields.materialsUsed.trim() || !closingFields.estimatedLaborHours) {
                  return toast({
                    variant: "destructive",
                    title: "Required Fields Missing",
                    description: "Please fill out all required fields to close the ticket.",
                  });
                }
                const payload = {
                  ...closingFields,
                  estimatedLaborHours: closingFields.estimatedLaborHours ? parseFloat(closingFields.estimatedLaborHours) : null,
                };
                setPendingStatusUpdate({ status: 2, extraFields: payload });
                setShowCloseConfirm(true);
              }}>Save & Close Ticket</Button>
            </div>
          </div>
        </div>
      )}

      {showStatusConfirm && pendingStatusUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4" onClick={() => { setShowStatusConfirm(false); setStatus(previousStatus); setPendingStatusUpdate(null); }}>
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative z-[80]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">Confirm Status Change</h3>
            <p className="text-sm text-gray-700 mb-4">Are you sure you want to set this ticket to In Progress?</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setShowStatusConfirm(false); setStatus(previousStatus); setPendingStatusUpdate(null); }}>Cancel</Button>
              <Button onClick={() => {
                performStatusUpdate(pendingStatusUpdate.status, pendingStatusUpdate.extraFields);
                setShowStatusConfirm(false);
              }}>Yes, Set In Progress</Button>
            </div>
          </div>
        </div>
      )}

      {showCloseConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4" onClick={() => { setShowCloseConfirm(false); setPendingStatusUpdate(null); }}>
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative z-[80]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">Confirm Close</h3>
            <p className="text-sm text-gray-700 mb-4">Are you sure you want to save changes and close this ticket?</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setShowCloseConfirm(false); setPendingStatusUpdate(null); }}>Cancel</Button>
              <Button onClick={() => {
                const payload = pendingStatusUpdate?.extraFields || {
                  ...closingFields,
                  estimatedLaborHours: closingFields.estimatedLaborHours ? parseFloat(closingFields.estimatedLaborHours) : null,
                };
                performStatusUpdate(2, payload);
                setPendingStatusUpdate(null);
                setShowCloseConfirm(false);
                setShowClosingPrompt(false);
              }}>Yes, Close Ticket</Button>
            </div>
          </div>
        </div>
      )}

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
        currentAssigned={ticket.assignedTo?.name}
        onAssignmentSuccess={fetchTicket}
      />
      
      </CardContent>
    </Card>
      
      {/* Files */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Files</CardTitle>
        </CardHeader>

        <CardContent>
          <FileDownload ticketId={ticket.ticketId} />
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
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="0">Open</option>
            <option value="1">In Progress</option>
            <option value="2">Closed</option>
          </select>

          <Button onClick={() => handleStatusUpdate()}>Update Status</Button>
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
    </>
  );
};

export default TicketDetails;
