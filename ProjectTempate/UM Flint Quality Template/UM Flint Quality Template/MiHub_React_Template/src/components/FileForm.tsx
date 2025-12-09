import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '../hooks/use-toast';
import { useDebounce } from '../hooks/use-debounce';
import { logAudit } from './utils/auditLogger';
import { getFileIcon } from "./utils/fileHelper";
import { useFileHelper } from "../hooks/useFileHelper";
import { api } from "../api";

import {
    Division,
    WorkOrder,
    Unit,
    Sequence,
    Nonconformance,
    LaborDepartment
} from '../types';


interface SavedFile {
    name: string;
    data: string; // Base64 string
    isFile: boolean;
    file: File;          // Original File object (needed for upload)
    uploaded?: boolean;  // Track if this file has been uploaded
    fileKey?: string;   // Key returned from backend
    previewType: "image" | "pdf" | "doc" | "excel" | "txt" | "zip" | "other";
    color?: string;
}

const STORAGE_KEY = "ticketDraft";

// A helper to check if a value is a non-empty string
const isSet = (value: string | null | undefined) => value !== null && value !== undefined && value !== '';

interface FileFormProps {
    onClose?: () => void;
}

const FileForm: React.FC<FileFormProps> = ({ onClose }) => {
    // --- Form State ---
    const [divisionId, setDivisionId] = useState('');
    const [workOrderId, setWorkOrderId] = useState('');
    const [laborDeptId, setLaborDeptId] = useState('');
    const [manNonConId, setManNonConId] = useState('');
    const [unitId, setUnitId] = useState('');
    const [seqID, setseqID] = useState('');
    const [drawingNum, setDrawingNum] = useState(''); // Changed to string input
    const [description, setDescription] = useState('');
    //const [files, setfiles] = useState<SavedFile[]>([]); //Files

    // --- Search State (Only for Global/Large lists) ---
    const [divisionSearch, setDivisionSearch] = useState('');
    const [workOrderSearch, setWorkOrderSearch] = useState('');
    
    // For filtered lists, we just hold the selection text for the input display
    const [laborDeptText, setLaborDeptText] = useState('');
    const [manNonConText, setManNonConText] = useState('');
    const [unitText, setUnitText] = useState('');
    const [sequenceText, setSequenceText] = useState('');

    // Debounced search values for global lists
    const debouncedDivisionSearch = useDebounce(divisionSearch, 300);
    const debouncedWorkOrderSearch = useDebounce(workOrderSearch, 300);

    const { userId } = useAuth();
    const { toast } = useToast();

    // --- Dropdown Data State ---
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    
    // These lists are filtered based on the selected Work Order
    const [laborDepts, setLaborDepts] = useState<LaborDepartment[]>([]);
    const [manNonCons, setManNonCons] = useState<Nonconformance[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [sequences, setSequences] = useState<Sequence[]>([]);

    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showPostCreate, setShowPostCreate] = useState(false);
    const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

    // --- Load Draft ---
    useEffect(() => {
        const draft = localStorage.getItem(STORAGE_KEY);
        if (draft) {
            try {
                const parsed = JSON.parse(draft);
                setDivisionId(parsed.divisionId || '');            
                setWorkOrderId(parsed.workOrderId || '');
                setLaborDeptId(parsed.laborDeptId || '');
                setManNonConId(parsed.manNonConId || '');
                setUnitId(parsed.unitId || '');
                setseqID(parsed.seqID || '');
                setDrawingNum(parsed.drawingNum || '');
                setDescription(parsed.description || '');
                
                // Restore search/text terms
                setDivisionSearch(parsed.divisionSearch || '');
                setWorkOrderSearch(parsed.workOrderSearch || '');
                setLaborDeptText(parsed.laborDeptText || '');
                setManNonConText(parsed.manNonConText || '');
                setUnitText(parsed.unitText || '');
                setSequenceText(parsed.sequenceText || '');
            } catch (e) {
                console.warn("Failed to parse draft", e);
            }
        }
        setLoading(false);
    }, []);

    // --- Auto-Save Draft ---
    useEffect(() => {
        if (loading) return;
        const data = { 
            divisionId, workOrderId, laborDeptId, manNonConId, unitId, seqID, drawingNum, description,
            divisionSearch, workOrderSearch, laborDeptText, manNonConText, unitText, sequenceText
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [
        divisionId, workOrderId, laborDeptId, manNonConId, unitId, seqID, drawingNum, description,
        divisionSearch, workOrderSearch, laborDeptText, manNonConText, unitText, sequenceText, loading
    ]);

    // --- Data Fetching: Global Lists ---
    const fetchGlobalDropdownData = async (endpoint: string, setter: React.Dispatch<React.SetStateAction<any[]>>, search: string = '') => {
        try {
            const url = search ? `/${endpoint}?search=${search}` : `/${endpoint}`;
            const response = await api.get<any[]>(url);
            setter(response.data);
        } catch (error) {
            console.error(`Failed to fetch ${endpoint}:`, error);
        }
    };

    // Fetch global lists on debounce
    useEffect(() => { 
        if (debouncedDivisionSearch || !divisionId) {
            fetchGlobalDropdownData('divisions', setDivisions, debouncedDivisionSearch); 
        }
    }, [debouncedDivisionSearch, divisionId]); // Added divisionId

    useEffect(() => { 
        if (debouncedWorkOrderSearch || !workOrderId) {
            fetchGlobalDropdownData('work-orders', setWorkOrders, debouncedWorkOrderSearch); 
        }
    }, [debouncedWorkOrderSearch, workOrderId]); // Added workOrderId

    // --- Data Fetching: Filtered Lists (Dependent on Work Order) ---
    useEffect(() => {
        const fetchFilteredData = async () => {
            if (!workOrderId) {
                // Clear filtered lists if no WO is selected
                setLaborDepts([]);
                setManNonCons([]);
                setUnits([]);
                setSequences([]);
                return;
            }

            try {
                // Fetch all dependencies in parallel
                const [deptRes, nonConRes, unitRes, seqRes] = await Promise.all([
                    api.get<LaborDepartment[]>(`/work-orders/${workOrderId}/labor-departments`),
                    api.get<Nonconformance[]>(`/work-orders/${workOrderId}/nonconformances`),
                    api.get<Unit[]>(`/work-orders/${workOrderId}/units`),
                    api.get<Sequence[]>(`/work-orders/${workOrderId}/sequences`)
                ]);

                setLaborDepts(deptRes.data);
                setManNonCons(nonConRes.data);
                setUnits(unitRes.data);
                setSequences(seqRes.data);

            } catch (error) {
                console.error("Failed to fetch filtered data for Work Order:", error);
            }
        };

        fetchFilteredData();
    }, [workOrderId]);

    const MAX_FILES = 10;
   
    
     const { files, setFiles, handleFileUpload } = useFileHelper();


    const handleSave = async () => {
        // --- Validation ---
        if (!userId) { toast({ variant: "destructive", title: "Authentication Error", description: "User could not be identified." }); return; }
        if (!divisionId) { toast({ variant: "destructive", title: "Validation Error", description: "'Division' field is empty." }); return; }
        if (!workOrderId) { toast({ variant: "destructive", title: "Validation Error", description: "'Work Order' field is empty." }); return; }
        if (!laborDeptId) { toast({ variant: "destructive", title: "Validation Error", description: "'Labor Department' field is empty." }); return; }
        if (!manNonConId) { toast({ variant: "destructive", title: "Validation Error", description: "'Manufacturing Nonconformance' field is empty." }); return; }
        if (!description) { toast({ variant: "destructive", title: "Validation Error", description: "Description is a required field." }); return; }

        // --- Check File Limit ---
        if (files.length > MAX_FILES) {
            toast({
            title: "Upload Limit Reached",
            description: `You can only upload up to ${MAX_FILES} files.`,
            variant: "destructive",
            });
            return;
        }

        setIsSaving(true);

        // Construct payload based on ticket.entity.js relations
        const ticketPayload = {
            description,
            initiator: userId,
            status: 0,
            drawingNum: drawingNum, // Passed as string now
            ...(isSet(divisionId) && { division: parseInt(divisionId) }),
            ...(isSet(workOrderId) && { wo: parseInt(workOrderId) }),
            ...(isSet(laborDeptId) && { laborDepartment: parseInt(laborDeptId) }), // New Field
            ...(isSet(manNonConId) && { manNonCon: parseInt(manNonConId) }),
            ...(isSet(unitId) && { unit: parseInt(unitId) }),
            ...(isSet(seqID) && { sequence: parseInt(seqID) }),
        };

        try {
            const response = await api.post<any>('/tickets', ticketPayload);
            const newTicket = response.data;
            toast({ title: "Success!", description: `Ticket ${newTicket.qualityTicketId} has been created.` });

            // --- Upload Multiple Files ---
            for (const f of files) {
            if (f.uploaded) continue; // skip already uploaded

            // Build FormData for this file
            const formData = new FormData();
            formData.append("ticketId", newTicket.ticketId.toString());   // ✅ use DB PK
            formData.append("fileKey", `${newTicket.ticketId}_${Date.now()}_${f.name}`);                          // or unique key
            formData.append("imageFile", f.file);                         // raw File object

            try {
                await api.post('/files/upload', formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });

                setFiles(prev =>
                prev.map(file =>
                    file.name === f.name ? { ...file, uploaded: true } : file
                )
                );
            } catch (err: any) {
                const errMsg = err.response?.data?.message || err.message || "Upload Failed";
                toast({ variant: "destructive", title: "Upload Failed", description: errMsg });
            }
            }
            
            // Log Ticket Creation
            await logAudit(userId, "Create", parseInt(newTicket.ticketId, 10), parseInt(workOrderSearch, 10));


            handleDelete(); // Clear form
            setCreatedTicketId(newTicket.qualityTicketId);
            setShowPostCreate(true);

        } catch (error: any) {
            const errMsg = error.response?.data?.message || error.message || "Save Failed";
            toast({ variant: "destructive", title: "Save Failed", description: errMsg });
            console.error("Failed to save ticket:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const confirmAndSave = () => {
        setShowSubmitConfirm(true);
    };

    const handleDelete = () => {
        setDivisionId('');
        setWorkOrderId('');
        setLaborDeptId('');
        setManNonConId('');
        setUnitId('');
        setseqID('');
        setDrawingNum('');
        setDescription('');
        setFiles([]);
        
        setDivisionSearch('');
        setWorkOrderSearch('');
        setLaborDeptText('');
        setManNonConText('');
        setUnitText('');
        setSequenceText('');

        localStorage.removeItem(STORAGE_KEY);
        const FileInput = document.getElementById('FileUpload') as HTMLInputElement;
        if (FileInput) FileInput.value = '';
    };

    if (loading) {
        return <div className="text-center p-6">Loading form...</div>;
    }

    return (
        <div className="space-y-6">
            <p className="text-sm text-gray-500 mb-6">Fields marked with <span className="text-red-500 font-bold">*</span> are required.</p>

            {/* 1. Division Dropdown (Global) */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Division <span className="text-red-500">*</span></label>
                <input
                    list="division-list"
                    value={divisionSearch}
                    onChange={(e) => {
                        setDivisionSearch(e.target.value);
                        const selected = divisions.find(d => d.divisionName === e.target.value);
                        setDivisionId(selected ? String(selected.divisionId) : '');
                    }}
                    onFocus={() => !divisionSearch && fetchGlobalDropdownData('divisions', setDivisions)}
                    placeholder="Search or select a division"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
                <datalist id="division-list">
                    {divisions.map((d) => <option key={d.divisionId} value={d.divisionName} />)}
                </datalist>
            </div>

            {/* 2. Work Order Dropdown (Global) */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Work Order <span className="text-red-500">*</span></label>
                <input
                    list="workorder-list"
                    value={workOrderSearch}
                    onChange={(e) => {
                        setWorkOrderSearch(e.target.value);
                        const selected = workOrders.find(wo => String(wo.wo) === e.target.value);
                        setWorkOrderId(selected ? String(selected.woId) : '');
                        
                        // Reset dependent fields when WO changes
                        setLaborDeptId(''); setLaborDeptText('');
                        setManNonConId(''); setManNonConText('');
                        setUnitId(''); setUnitText('');
                        setseqID(''); setSequenceText('');
                    }}
                    onFocus={() => !workOrderSearch && fetchGlobalDropdownData('work-orders', setWorkOrders)}
                    placeholder="Search or select a work order"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
                <datalist id="workorder-list">
                    {workOrders.map((wo) => <option key={wo.woId} value={wo.wo} />)}
                </datalist>
            </div>

            {/* 3. Labor Department (Filtered by WO) */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Labor Department <span className="text-red-500">*</span></label>
                <input
                    list="labor-dept-list"
                    value={laborDeptText}
                    disabled={!workOrderId}
                    onChange={(e) => {
                        setLaborDeptText(e.target.value);
                        const selected = laborDepts.find(d => d.departmentName === e.target.value);
                        setLaborDeptId(selected ? String(selected.departmentId) : '');
                    }}
                    placeholder={workOrderId ? "Select a labor department" : "Select a Work Order first"}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 disabled:bg-gray-100"
                />
                <datalist id="labor-dept-list">
                    {laborDepts.map((d) => <option key={d.departmentId} value={d.departmentName} />)}
                </datalist>
            </div>

            {/* 4. Manufacturing Nonconformance (Filtered by WO) */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Manufacturing Nonconformance <span className="text-red-500">*</span></label>
                <input
                    list="noncon-list"
                    value={manNonConText}
                    disabled={!workOrderId}
                    onChange={(e) => {
                        setManNonConText(e.target.value);
                        const selected = manNonCons.find(m => m.nonCon === e.target.value);
                        setManNonConId(selected ? String(selected.nonConId) : '');
                    }}
                    placeholder={workOrderId ? "Select a nonconformance" : "Select a Work Order first"}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 disabled:bg-gray-100"
                />
                <datalist id="noncon-list">
                    {manNonCons.map((m) => <option key={m.nonConId} value={m.nonCon} />)}
                </datalist>
            </div>

            {/* 5. Unit (Filtered by WO) */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <input
                    list="unit-list"
                    value={unitText}
                    disabled={!workOrderId}
                    onChange={(e) => {
                        setUnitText(e.target.value);
                        const selected = units.find(u => u.unitName === e.target.value);
                        setUnitId(selected ? String(selected.unitId) : '');
                    }}
                    placeholder={workOrderId ? "Select a unit" : "Select a Work Order first"}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 disabled:bg-gray-100"
                />
                <datalist id="unit-list">
                    {units.map((u) => <option key={u.unitId} value={u.unitName} />)}
                </datalist>
            </div>

            {/* 6. Sequence (Filtered by WO) */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Sequence</label>
                <input
                    list="sequence-list"
                    value={sequenceText}
                    disabled={!workOrderId}
                    onChange={(e) => {
                        setSequenceText(e.target.value);
                        const selected = sequences.find(s => s.seqName === e.target.value);
                        setseqID(selected ? String(selected.seqID) : '');
                    }}
                    placeholder={workOrderId ? "Select a sequence" : "Select a Work Order first"}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 disabled:bg-gray-100"
                />
                <datalist id="sequence-list">
                    {sequences.map((s) => <option key={s.seqID} value={s.seqName} />)}
                </datalist>
            </div>

            {/* 7. Drawing Number (Manual Text Input) */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Drawing #</label>
                <input
                    type="text"
                    value={drawingNum}
                    onChange={(e) => setDrawingNum(e.target.value)}
                    placeholder="Enter drawing number"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
            </div>

            {/* 8. Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
                <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    rows={4} 
                    placeholder='Type Here' 
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
            </div>

            {/* 9. File Upload */}
            <div
                className="flex flex-col items-center justify-center space-y-2 mt-6 border-2 border-dashed border-gray-300 p-6 rounded cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    const files = Array.from(e.dataTransfer.files);
                    handleFileUpload(files);
                }}
            >
                <label htmlFor="FileUpload" className="cursor-pointer flex flex-col items-center">
                    <img src="/icons/upload-icon.png" alt="Upload Icon" className="w-65 h-56 mb-2"/>
                    <span className="text-blue-600 hover:text-blue-800 text-lg font-medium">Upload or Drag Files</span>
                </label>
                <input
                    id="FileUpload"
                    type="file"
                    multiple
                    onChange={(e) => e.target.files && handleFileUpload(Array.from(e.target.files))}
                    className="hidden"
                />

                {files.length > 0 && (
                <ul className="mt-6 space-y-4 text-sm text-gray-700 w-full">
                {files.map((f, i) => {
                const Icon = getFileIcon(f.previewType);
                return (
                            <li key={i} className="flex items-center bg-gray-100 p-2 rounded">
                    {f.previewType === "image" ? (
                        <img src={f.data} alt={f.name} className="w-16 h-14 object-cover rounded mr-2" />
                                ) : (
                                    <div className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded mr-2">
                        <Icon className={`w-6 h-6 ${f.color}`} />
                                    </div>
                                )}
                    <span className="flex-1 truncate">{f.name}</span>
                                <button
                                    onClick={() => setFiles(prev => prev.filter((_, index) => index !== i))}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </li>
                );
                })}
                    </ul>
                )}
            </div>

            {/* Save/Delete Actions */}
            <div className="flex justify-end space-x-4">
                <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                    Clear Draft
                </button>
                <button onClick={confirmAndSave} disabled={isSaving} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400">
                    {isSaving ? 'Saving...' : 'Save'}
                </button>
            </div>

            {/* Confirm Modal */}
            {showSubmitConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-2">Ready to submit?</h3>
                        <p className="text-sm text-gray-700 mb-4">Are you sure you want to submit this ticket? You can cancel to continue editing.</p>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => { setShowSubmitConfirm(false); }} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Cancel</button>
                            <button onClick={async () => { setShowSubmitConfirm(false); await handleSave(); }} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Submit</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Post-Create Modal */}
            {showPostCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-2">Ticket Created</h3>
                        <p className="text-sm text-gray-700 mb-4">Ticket {createdTicketId} has been created successfully. What would you like to do next?</p>
                        <div className="flex justify-end space-x-3">
                            <button 
                                onClick={() => { 
                                    setShowPostCreate(false); 
                                    setCreatedTicketId(null); 
                                    const desc = document.querySelector('textarea') as HTMLTextAreaElement | null; 
                                    if (desc) desc.focus(); 
                                }} 
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                Create Another
                            </button>
                            <button 
                                onClick={() => { setShowPostCreate(false); if (onClose) onClose(); }} 
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Return to List
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default FileForm;
