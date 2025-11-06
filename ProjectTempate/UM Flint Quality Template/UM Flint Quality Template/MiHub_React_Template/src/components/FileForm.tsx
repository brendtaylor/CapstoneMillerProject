import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '../hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Status {
    statusId: number;
    statusDescription: string;
}

interface Division {
    divisionId: number;
    divisionName: string;
}

interface Part {
    partNumId: number;
    partNum: string;
}

interface Drawing {
    drawingId: number;
    drawing_num: string;
}

interface WorkOrder {
    woId: number;
    wo: number;
}

interface Unit {
    unitId: number;
    unitName: string;
}

interface Sequence {
    seqID: number;
    seqName: string;
}

interface ManNonCon {
    nonConId: number;
    nonCon: string;
}

interface SavedImage {
    name: string;
    data: string; //Base64 string
}

const STORAGE_KEY = "ticketDraft";

// A helper to check if a value is a non-empty string
const isSet = (value: string | null | undefined) => value !== null && value !== undefined && value !== '';


interface FileFormProps {
    onClose?: () => void;
}

const FileForm: React.FC<FileFormProps> = ({ onClose }) => {
    const [divisionId, setDivisionId] = useState('');
    const [partNumber, setPartNumber] = useState('');
    const [partNumId, setPartNumId] = useState('');
    const [drawingId, setDrawingId] = useState('');
    const [workOrderId, setWorkOrderId] = useState('');
    const [unitId, setUnitId] = useState('');
    const [sequenceId, setSequenceId] = useState('');
    const [manNonConId, setManNonConId] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState<SavedImage[]>([]);

    const { userId } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    // State for dropdown options
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [parts, setParts] = useState<Part[]>([]);
    const [drawings, setDrawings] = useState<Drawing[]>([]);
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [sequences, setSequences] = useState<Sequence[]>([]);
    const [manNonCons, setManNonCons] = useState<ManNonCon[]>([]);

    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    // Show a post-create prompt offering to create another ticket or return to the list
    const [showPostCreate, setShowPostCreate] = useState(false);
    const [createdTicketId, setCreatedTicketId] = useState<number | null>(null);
    // Show a styled confirmation modal before submitting (replaces window.confirm)
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

    //Load draft from localStorage when component mounts
    useEffect(() => {
        const draft = localStorage.getItem(STORAGE_KEY);
        if (draft) {
            try {
            const parsed = JSON.parse(draft);
            setDivisionId(parsed.divisionId || '');
            setPartNumber(parsed.partNumber || '');
            setPartNumId(parsed.partNumId || '');
            setDrawingId(parsed.drawingId || '');
            setWorkOrderId(parsed.workOrderId || '');
            setUnitId(parsed.unitId || '');
            setSequenceId(parsed.sequenceId || '');
            setManNonConId(parsed.manNonConId || '');
            setDescription(parsed.description || '');
            setImages(parsed.images || []);
        } catch (e) {
                console.warn("Failed to parse draft", e);
            }
        }
    }, []);

    // Fetch data for all dropdowns
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
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
                // Optionally, show a toast or error message to the user
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    //Auto-save draft to localStorage whenever fields change 
    useEffect(() => {
        // Avoid saving initial empty state
        if (loading) return;
        const data = { divisionId, partNumber, partNumId, drawingId, workOrderId, unitId, sequenceId, manNonConId, description, images };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [divisionId, partNumber, partNumId, drawingId, workOrderId, unitId, sequenceId, manNonConId, description, images, loading]);
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const fileArray = Array.from(e.target.files);
        fileArray.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages(prev => [...prev, { name: file.name, data: reader.result as string }]);
            };
            reader.readAsDataURL(file);
        });
    }
};


    const handleSave = async () => {
        if (!userId) {
            toast({ variant: "destructive", title: "Authentication Error", description: "User could not be identified. Please log in again." });
            return;
        }
        if (!description) {
            toast({ variant: "destructive", title: "Validation Error", description: "Description is a required field." });
            return;
        }

        setIsSaving(true);

        // Construct payload based on ticket.entity.js relations
        const ticketPayload = {
            description,
            initiator: userId,
            status: 0,
            ...(isSet(divisionId) && { division: parseInt(divisionId) }),
            ...(isSet(workOrderId) && { wo: parseInt(workOrderId) }),
            ...(isSet(sequenceId) && { sequence: parseInt(sequenceId) }),
            ...(isSet(drawingId) && { drawingNum: parseInt(drawingId) }),
            ...(isSet(partNumId) && { partNum: parseInt(partNumId) }),
            ...(isSet(manNonConId) && { manNonCon: parseInt(manNonConId) }),
            ...(isSet(unitId) && { unit: parseInt(unitId) }),
        };

        try {
            const response = await fetch('http://localhost:3000/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ticketPayload),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create ticket.');
            }
            console.log(response);
            const newTicket = await response.json();
            toast({ title: "Success!", description: `Ticket #${newTicket.ticketId} has been created.` });
            // Clear the form and local storage draft
            handleDelete();
            // Show a post-create prompt (create another or return to list)
            setCreatedTicketId(newTicket.ticketId);
            setShowPostCreate(true);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Save Failed", description: error.message });
            console.error("Failed to save ticket:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const confirmAndSave = () => {
        // Open the styled confirmation modal instead of using window.confirm
        setShowSubmitConfirm(true);
    };

    const handleDelete = () => {
        setDivisionId('');
        setPartNumber('');
        setPartNumId('');
        setDrawingId('');
        setWorkOrderId('');
        setUnitId('');
        setSequenceId('');
        setManNonConId('');
        setDescription('');
        setImages([]);
        localStorage.removeItem(STORAGE_KEY);

        const imageInput = document.getElementById('imageUpload') as HTMLInputElement;
        if (imageInput) imageInput.value = '';
    };

    if (loading) {
        return <div className="text-center p-6">Loading form...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white shadow-md rounded-md space-y-6">
        

        {/* Division Dropdown */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Division</label>
            <select
            value={divisionId}
            onChange={(e) => setDivisionId(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
            <option value="">Select Division</option>
            {divisions.map((d) => (
                <option key={d.divisionId} value={d.divisionId}>{d.divisionName}</option>
            ))}
            </select>
        </div>

        {/* Part Dropdown */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Part</label>
            <select value={partNumId} onChange={(e) => setPartNumId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                <option value="">Select Part</option>
                {parts.map((p) => (
                    <option key={p.partNumId} value={p.partNumId}>{p.partNum}</option>
                ))}
            </select>
        </div>

        {/* Drawing Dropdown */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Drawing</label>
            <select value={drawingId} onChange={(e) => setDrawingId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                <option value="">Select Drawing</option>
                {drawings.map((d) => (
                    <option key={d.drawingId} value={d.drawingId}>{d.drawing_num}</option>
                ))}
            </select>
        </div>

        {/* Work Order Dropdown */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Work Order</label>
            <select value={workOrderId} onChange={(e) => setWorkOrderId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                <option value="">Select Work Order</option>
                {workOrders.map((wo) => (
                    <option key={wo.woId} value={wo.woId}>{wo.wo}</option>
                ))}
            </select>
        </div>

        {/* Unit Dropdown */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Unit</label>
            <select value={unitId} onChange={(e) => setUnitId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                <option value="">Select Unit</option>
                {units.map((u) => (
                    <option key={u.unitId} value={u.unitId}>{u.unitName}</option>
                ))}
            </select>
        </div>

        {/* Sequence Dropdown */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Sequence</label>
            <select value={sequenceId} onChange={(e) => setSequenceId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                <option value="">Select Sequence</option>
                {sequences.map((s) => (
                    <option key={s.seqID} value={s.seqID}>{s.seqName}</option>
                ))}
            </select>
        </div>

        {/* Manufacturing Nonconformance Dropdown */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Manufacturing Nonconformance</label>
            <select
            value={manNonConId}
            onChange={(e) => setManNonConId(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
            <option value="">Select Nonconformance</option>
            {manNonCons.map((m) => (
                <option key={m.nonConId} value={m.nonConId}>{m.nonCon}</option>
            ))}
            </select>
        </div>

        {/* Image Upload */}
        <div className="flex flex-col items-center justify-center space-y-2 mt-6">
            
        {/* Upload Icon */}
        <label htmlFor="imageUpload" className="cursor-pointer flex flex-col items-center">
            <img src="/icons/upload-icon.png" alt="Upload Icon" className="w-26 h-26 mb-2"/>
            <span className="text-blue-600 hover:text-blue-800 text-lg font-medium">Upload Image</span>
        </label>
        <input
            id="imageUpload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            />

        {/* Uploaded Images */}
        {images.length > 0 && (
            <ul className="mt-2 space-y-2 text-sm text-gray-700 w-full">
            {images.map((img, i) => (
                <li key={i} className="flex items-center bg-gray-100 p-2 rounded">
                <img src={img.data} alt={img.name} className="w-16 h-16 object-cover rounded mr-2"/>
                <span className="flex-1">{img.name}</span>
                <button
                    onClick={() => setImages(prev => prev.filter((_, index) => index !== i))}
                    className="text-red-500 hover:text-red-700"
                >
                    Remove
                </button>
                </li>
            ))}
            </ul>
        )}
        </div>
            
        {/* Description */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder='Type Here' className="mt-1 block w-full border border-gray-300 rounded-md p-2"/>
        </div>

        {/* Save/Delete */}
        <div className="flex justify-end space-x-4">
            <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                Delete Draft
            </button>
            <button onClick={confirmAndSave} disabled={isSaving} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400">
                {isSaving ? 'Saving...' : 'Save'}
            </button>
        </div>

        {/* Pre-submit confirmation modal (replaces window.confirm) */}
        {showSubmitConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
                    <h3 className="text-lg font-semibold mb-2">Ready to submit?</h3>
                    <p className="text-sm text-gray-700 mb-4">Are you sure you want to submit this ticket? You can cancel to continue editing.</p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => {
                                // Cancel and return to editing
                                setShowSubmitConfirm(false);
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={async () => {
                                // Close confirmation modal and submit
                                setShowSubmitConfirm(false);
                                await handleSave();
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Post-create prompt modal */}
        {showPostCreate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
                    <h3 className="text-lg font-semibold mb-2">Ticket Created</h3>
                    <p className="text-sm text-gray-700 mb-4">Ticket #{createdTicketId} has been created successfully. What would you like to do next?</p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => {
                                // Close modal and keep the cleared form ready to create another
                                setShowPostCreate(false);
                                setCreatedTicketId(null);
                                // focus description for faster entry
                                const desc = document.querySelector('textarea') as HTMLTextAreaElement | null;
                                if (desc) desc.focus();
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Create Another
                        </button>
                        <button
                            onClick={() => {
                                setShowPostCreate(false);
                                // Call the onClose prop to close the form
                                if (onClose) onClose();
                                // No need to navigate since we're already on /quality
                            }}
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
