import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useToast } from "../../hooks/use-toast";
import ScaleLoader from "react-spinners/ScaleLoader";
import { Textarea } from "../../components/ui/textarea";
import { Input } from "../../components/ui/input";
import AssignUser from "../../components/AssignUser";
import { useAuth } from "../../components/AuthContext";
import { requiresAssignedUser } from "../../lib/ticketRules";
import type { 
  Ticket,
  Division, 
  WorkOrder, 
  Unit, 
  Sequence, 
  LaborDepartment,
  Nonconformance
} from "../../types";
import FileDownload from "../../components/FileDownload";
import { logAudit } from "../../components/utils/auditLogger";
import { useDebounce } from "../../hooks/use-debounce";

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
  const { userId, userRole } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  // Detect Archive Mode based on URL path
  const isArchived = location.pathname.includes("/archived/");

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

  // --- Edit State ---
  const [isEditing, setIsEditing] = useState(false);
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
    manNonConId: '', unitId: '', seqID: '', drawingNum: '', description: '',
  });

  const [editDivisionSearch, setEditDivisionSearch] = useState('');
  const [editWorkOrderSearch, setEditWorkOrderSearch] = useState('');
  const [editLaborDeptText, setEditLaborDeptText] = useState('');
  const [editNonconformanceText, setEditNonconformanceText] = useState('');
  const [editUnitText, setEditUnitText] = useState('');
  const [editSequenceText, setEditSequenceText] = useState('');

  const debouncedEditDivisionSearch = useDebounce(editDivisionSearch, 300);
  const debouncedEditWorkOrderSearch = useDebounce(editWorkOrderSearch, 300);

  // --- End Edit State ---

  const resetToPreviousStatus = () => setStatus(previousStatus);

  // Load Ticket Info
  const fetchTicket = async () => {
    try {
      // Switch endpoint based on mode
      const endpoint = isArchived 
        ? `http://localhost:3000/api/tickets/archived/${id}`
        : `http://localhost:3000/api/tickets/${id}`;

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Ticket not found");
      
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
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchTicket();
      await fetchNotes();
      setLoading(false);
    };
    load();
  }, [id, isArchived]);

  // Add Note
  const handleAddNote = async () => {
    if (isArchived) return; // Guard: Cannot add notes to archived tickets

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
        body: JSON.stringify({ note: noteText, authorId: userId }),
      });

      setNoteText("");
      fetchNotes();
      toast({ title: "Success", description: "Note added." });
      
      // Audit Log
      if (userId && ticket) {
        logAudit(userId, "Note Added", ticket.ticketId, parseInt(ticket.wo?.wo));
      }
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
      await fetch(`http://localhost:3000/api/tickets/${id}`, { 
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusToUpdate, ...extraFields }),
      });

      toast({ title: "Success", description: "Status updated." });
      fetchTicket();

      // Audit Log
      if (userId && ticket) {
        const getStatusDesc = (s: number) => s === 0 ? "Open" : s === 1 ? "In-Progress" : "Closed";
        const newStatusDesc = getStatusDesc(statusToUpdate);
        logAudit(userId, `Status: ${ticket.status?.statusDescription} → ${newStatusDesc}`, ticket.ticketId, parseInt(ticket.wo?.wo));
      }
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
    if (isArchived) return; // Guard

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
    if (isArchived) return; // Guard

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

  // --- NAVIGATION HANDLER ---
  const handleBack = () => {
    // Navigate to Quality page with state indicating which tab to open
    if (isArchived) {
      navigate("/quality", { state: { activeTab: "archivedTickets" } });
    } else {
      navigate("/quality", { state: { activeTab: "tickets" } });
    }
  };

  // --- EDIT LOGIC ---
  const handleEdit = () => {
    if (!ticket) return;
    setIsEditing(true);

    setEditFields({
      status: ticket.status?.statusId?.toString() || '0',
      divisionId: ticket.division?.divisionId?.toString() || '',
      workOrderId: ticket.wo?.woId?.toString() || '',
      laborDeptId: ticket.laborDepartment?.departmentId?.toString() || '',
      manNonConId: ticket.manNonCon?.nonConId?.toString() || '',
      unitId: ticket.unit?.unitId?.toString() || '',
      seqID: ticket.sequence?.seqID?.toString() || '',
      drawingNum: ticket.drawingNum || '', description: ticket.description || '',
    });

    setEditDivisionSearch(ticket.division?.divisionName || '');
    setEditWorkOrderSearch(ticket.wo?.wo || '');
    setEditLaborDeptText(ticket.laborDepartment?.departmentName || '');
    setEditNonconformanceText((ticket.manNonCon as any)?.nonCon || '');
    setEditUnitText(ticket.unit?.unitName || '');
    setEditSequenceText(ticket.sequence?.seqName || '');
    
    fetchGlobalDropdownData('divisions', setDivisions);
    fetchGlobalDropdownData('work-orders', setWorkOrders);
  };

  const handleSaveEdit = async () => {
    if (!ticket) return;
    if (!userId) { toast({ variant: "destructive", title: "Error", description: "User not identified." }); return; }
    if (!editFields.divisionId || !editFields.workOrderId || !editFields.laborDeptId || !editFields.manNonConId || !editFields.description) { 
        toast({ variant: "destructive", title: "Validation Error", description: "Fill required fields." }); return; 
    }

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
        ...(editFields.seqID && { sequence: parseInt(editFields.seqID) }),
      };

      const response = await fetch(`http://localhost:3000/api/tickets/${ticket.ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Failed to update ticket.`);

      toast({ title: "Success", description: `Ticket ${ticket.qualityTicketId} has been updated.` });  
      await logAudit(userId, "Edit", ticket.ticketId, parseInt(ticket.wo?.wo));   
      await fetchTicket(); // Refetch ticket data to show updates
      setIsEditing(false);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update Failed", description: err.message });
    }
  };

  const fetchGlobalDropdownData = async (endpoint: string, setter: React.Dispatch<React.SetStateAction<any[]>>, search: string = '') => {
    try {
      const url = search ? `http://localhost:3000/api/${endpoint}?search=${search}` : `http://localhost:3000/api/${endpoint}`;
      const response = await fetch(url);
      if (response.ok) setter(await response.json());
    } catch (error) { console.error(`Failed to fetch ${endpoint}:`, error); }
  };

  useEffect(() => { if (isEditing) fetchGlobalDropdownData('divisions', setDivisions, debouncedEditDivisionSearch); }, [debouncedEditDivisionSearch, isEditing]);
  useEffect(() => { if (isEditing) fetchGlobalDropdownData('work-orders', setWorkOrders, debouncedEditWorkOrderSearch); }, [debouncedEditWorkOrderSearch, isEditing]);

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
  // --- END EDIT LOGIC ---

  // Handle assignment success: refetch and update status if needed
  const handleAssignmentSuccess = async () => {
    await fetchTicket(); // Refetch to get the latest ticket data
    // If the ticket was 'Open' (statusId 0), automatically set it to 'In Progress'
    if (ticket?.status?.statusId === 0) {
      // We can skip confirmation here as it's a logical next step
      handleStatusUpdate("1", undefined, { skipConfirmation: true });
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
      {/* Assignment Prompt Overlay - Only if NOT archived */}
      {!isArchived && showAssignmentPrompt && (
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
                setShowAssignmentPrompt(false); 
                fetchTicket(); 
                handleStatusUpdate("1", undefined, { skipConfirmation: true }); 
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

      {/* Closing Fields Prompt Overlay - Only if NOT archived */}
      {!isArchived && showClosingPrompt && (
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

      {/* Confirmation Modals - Only if NOT archived */}
      {!isArchived && showStatusConfirm && pendingStatusUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
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

      {!isArchived && showCloseConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
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

      {/* Edit Ticket Modal */}
      {isEditing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-3xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsEditing(false)} className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center bg-red-600 text-white text-2xl font-bold rounded-lg hover:bg-red-700">✕</button>
            <h2 className="text-xl font-semibold mb-4">Edit Ticket</h2>
            <p className="text-sm text-gray-500 mb-6">Fields marked with <span className="text-red-500 font-bold">*</span> are required.</p>
            <div className="space-y-6">
                <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1 flex items-center">
                      <span className="text-gray-900 font-medium">{editFields.status === '0' ? 'Open' : editFields.status === '1' ? 'In Progress' : 'Closed'}</span>
                      <span className="ml-2 text-xs text-gray-500 italic">(Status is changed on the Update Status section)</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Division <span className="text-red-500">*</span></label>
                    <Input list="edit-div-list" value={editDivisionSearch} onChange={(e) => { setEditDivisionSearch(e.target.value); const s = divisions.find(d => d.divisionName === e.target.value); setEditFields({ ...editFields, divisionId: s ? String(s.divisionId) : '' }); }} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                    <datalist id="edit-div-list">{divisions.map(d => <option key={d.divisionId} value={d.divisionName} />)}</datalist>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Work Order <span className="text-red-500">*</span></label>
                    <Input list="edit-wo-list" value={editWorkOrderSearch} onChange={(e) => { setEditWorkOrderSearch(e.target.value); const s = workOrders.find(w => String(w.wo) === e.target.value); setEditFields({ ...editFields, workOrderId: s ? String(s.woId) : '', laborDeptId: '', manNonConId: '', unitId: '', seqID: '' }); setEditLaborDeptText(''); setEditNonconformanceText(''); setEditUnitText(''); setEditSequenceText(''); }} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                    <datalist id="edit-wo-list">{workOrders.map(w => <option key={w.woId} value={w.wo} />)}</datalist>
                </div>
                {/* Dependent Fields */}
                <div><label className="block text-sm font-medium text-gray-700">Labor Dept <span className="text-red-500">*</span></label><Input list="edit-dept-list" value={editLaborDeptText} disabled={!editFields.workOrderId} onChange={(e) => { setEditLaborDeptText(e.target.value); const s = laborDepts.find(d => d.departmentName === e.target.value); setEditFields({...editFields, laborDeptId: s ? String(s.departmentId) : ''})}} className="mt-1 w-full border border-gray-300 rounded p-2 disabled:bg-gray-100"/><datalist id="edit-dept-list">{laborDepts.map(d => <option key={d.departmentId} value={d.departmentName}/>)}</datalist></div>
                <div><label className="block text-sm font-medium text-gray-700">Nonconformance <span className="text-red-500">*</span></label><Input list="edit-nc-list" value={editNonconformanceText} disabled={!editFields.workOrderId} onChange={(e) => { setEditNonconformanceText(e.target.value); const s = manNonCons.find(m => m.nonCon === e.target.value); setEditFields({...editFields, manNonConId: s ? String(s.nonConId) : ''})}} className="mt-1 w-full border border-gray-300 rounded p-2 disabled:bg-gray-100"/><datalist id="edit-nc-list">{manNonCons.map(m => <option key={m.nonConId} value={m.nonCon}/>)}</datalist></div>
                <div><label className="block text-sm font-medium text-gray-700">Unit</label><Input list="edit-unit-list" value={editUnitText} disabled={!editFields.workOrderId} onChange={(e) => { setEditUnitText(e.target.value); const s = units.find(u => u.unitName === e.target.value); setEditFields({...editFields, unitId: s ? String(s.unitId) : ''})}} className="mt-1 w-full border border-gray-300 rounded p-2 disabled:bg-gray-100"/><datalist id="edit-unit-list">{units.map(u => <option key={u.unitId} value={u.unitName}/>)}</datalist></div>
                <div><label className="block text-sm font-medium text-gray-700">Sequence</label><Input list="edit-seq-list" value={editSequenceText} disabled={!editFields.workOrderId} onChange={(e) => { setEditSequenceText(e.target.value); const s = sequences.find(q => q.seqName === e.target.value); setEditFields({...editFields, seqID: s ? String(s.seqID) : ''})}} className="mt-1 w-full border border-gray-300 rounded p-2 disabled:bg-gray-100"/><datalist id="edit-seq-list">{sequences.map(s => <option key={s.seqID} value={s.seqName}/>)}</datalist></div>
                <div><label className="block text-sm font-medium text-gray-700">Drawing #</label><Input type="text" value={editFields.drawingNum} onChange={(e) => setEditFields({...editFields, drawingNum: e.target.value})} className="mt-1 w-full border border-gray-300 rounded p-2"/></div>
                <div><label className="block text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label><Textarea rows={4} value={editFields.description} onChange={(e) => setEditFields({...editFields, description: e.target.value})} className="mt-1 w-full border border-gray-300 rounded p-2"/></div>
            </div>
            <div className="mt-6 p-3 bg-blue-50 rounded border border-blue-100 text-sm text-blue-800">
                <p><strong>Attachments:</strong> You can add or remove attachments in the "Uploaded Files" section below the ticket details.</p>
            </div>

            <div className="flex justify-end mt-6"><Button onClick={() => setShowSubmitConfirm(true)}>Save</Button></div>
            {showSubmitConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-2">Confirm</h3>
                        <p className="text-sm text-gray-700 mb-4">Submit changes?</p>
                        <div className="flex justify-end space-x-3">
                            <Button variant="outline" onClick={() => setShowSubmitConfirm(false)}>Cancel</Button>
                            <Button onClick={async () => { setShowSubmitConfirm(false); await handleSaveEdit(); }}>Submit</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
    )}

      <div className="max-w-3xl mx-auto mt-6 space-y-6">

        {/* Archived Banner */}
        {isArchived && (
          <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded shadow-sm" role="alert">
            <p className="font-bold">Archived Ticket</p>
            <p>This ticket is in the archive and cannot be modified.</p>
          </div>
        )}

        {/* Back Button */}
        <Button variant="outline" onClick={handleBack}>
          ← Back
        </Button>

        {/* Ticket Info */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ticket Details</CardTitle>
            {!isArchived && (userRole === 'admin' || userRole === 'editor') && (
              <Button variant="secondary" onClick={handleEdit}>
                Edit Ticket
              </Button>
            )}
          </CardHeader>

          <CardContent className="space-y-2">
            <p>
              <b>Ticket ID:</b> {ticket.qualityTicketId || `#${ticket.ticketId}`}
            </p>
            <p><b>Status:</b> {ticket.status?.statusDescription}</p>
            <p><b>Description:</b> {ticket.description}</p>
            <p><b>Work Order:</b> {ticket.wo?.wo}</p>
            <p><b>Division:</b> {ticket.division?.divisionName}</p>
            <p><b>Drawing #:</b> {ticket.drawingNum}</p>
            <p><b>Unit:</b> {ticket.unit?.unitName}</p>
            <p><b>Sequence:</b> {ticket.sequence?.seqName}</p>
            <p><b>Nonconformance:</b> {ticket.manNonCon?.nonCon}</p>
            <p><b>Opened:</b> {new Date(ticket.openDate).toLocaleString()}</p>
            <p><b>Initiator:</b> {ticket.initiator?.name}</p>
          </CardContent>
        </Card>
        
        {/* Assignment - Hide if Archived */}
        {!isArchived && (
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
                onAssignmentSuccess={handleAssignmentSuccess}
              />
            </CardContent>
          </Card>
        )}
        
        {/* Files - Always Visible (assuming download is read-only) */}
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
          </CardHeader>

          <CardContent>
            <FileDownload ticketId={ticket.ticketId} />
          </CardContent>
        </Card>

        {/* Status Update - Hide if Archived */}
        {!isArchived && (
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
        )}

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

            {/* Add Note - Hide input if Archived */}
            {!isArchived && (
              <>
                <Textarea
                  placeholder="Add a note..."
                  value={noteText}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                      setNoteText(e.target.value)}
                />

                <Button onClick={handleAddNote}>Add Note</Button>
              </>
            )}
          </CardContent>
        </Card>

      </div>
    </>
  );
};

export default TicketDetails;