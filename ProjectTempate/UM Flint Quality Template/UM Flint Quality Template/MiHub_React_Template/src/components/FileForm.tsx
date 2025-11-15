import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '../hooks/use-toast';
import { useDebounce } from '../hooks/use-debounce';

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
    const [partNumId, setPartNumId] = useState('');
    const [drawingId, setDrawingId] = useState('');
    const [workOrderId, setWorkOrderId] = useState('');
    const [unitId, setUnitId] = useState('');
    const [sequenceId, setSequenceId] = useState('');
    const [manNonConId, setManNonConId] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState<SavedImage[]>([]);

    // State for search input values
    const [divisionSearch, setDivisionSearch] = useState('');
    const [partSearch, setPartSearch] = useState('');
    const [drawingSearch, setDrawingSearch] = useState('');
    const [workOrderSearch, setWorkOrderSearch] = useState('');
    const [unitSearch, setUnitSearch] = useState('');
    const [sequenceSearch, setSequenceSearch] = useState('');
    const [manNonConSearch, setManNonConSearch] = useState('');

    // Debounced search values
    const debouncedDivisionSearch = useDebounce(divisionSearch, 300);
    const debouncedPartSearch = useDebounce(partSearch, 300);
    const debouncedDrawingSearch = useDebounce(drawingSearch, 300);
    const debouncedWorkOrderSearch = useDebounce(workOrderSearch, 300);
    const debouncedUnitSearch = useDebounce(unitSearch, 300);
    const debouncedSequenceSearch = useDebounce(sequenceSearch, 300);
    const debouncedManNonConSearch = useDebounce(manNonConSearch, 300);

    const { userId } = useAuth();
    const { toast } = useToast();

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
            setPartNumId(parsed.partNumId || '');
            setDrawingId(parsed.drawingId || '');
            setWorkOrderId(parsed.workOrderId || '');
            setUnitId(parsed.unitId || '');
            setSequenceId(parsed.sequenceId || '');
            setManNonConId(parsed.manNonConId || '');
            setDescription(parsed.description || '');
            setImages(parsed.images || []);
            // Restore search terms
            setDivisionSearch(parsed.divisionSearch || '');
            setPartSearch(parsed.partSearch || '');
            setDrawingSearch(parsed.drawingSearch || '');
            setWorkOrderSearch(parsed.workOrderSearch || '');
            setUnitSearch(parsed.unitSearch || '');
            setSequenceSearch(parsed.sequenceSearch || '');
            setManNonConSearch(parsed.manNonConSearch || '');
        } catch (e) {
                console.warn("Failed to parse draft", e);
            }
        }
    }, []);

    // Fetch data for all dropdowns
    const fetchDropdownData = async (endpoint: string, setter: React.Dispatch<React.SetStateAction<any[]>>, search: string = '') => {
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

    // Data will be fetched on user interaction.
    useEffect(() => {
        setLoading(false);
    }, []);


    // Effects to fetch data when debounced search terms change
    useEffect(() => { if (debouncedDivisionSearch) fetchDropdownData('divisions', setDivisions, debouncedDivisionSearch); }, [debouncedDivisionSearch]);
    useEffect(() => { if (debouncedPartSearch) fetchDropdownData('parts', setParts, debouncedPartSearch); }, [debouncedPartSearch]);
    useEffect(() => { if (debouncedDrawingSearch) fetchDropdownData('drawings', setDrawings, debouncedDrawingSearch); }, [debouncedDrawingSearch]);
    useEffect(() => { if (debouncedWorkOrderSearch) fetchDropdownData('work-orders', setWorkOrders, debouncedWorkOrderSearch); }, [debouncedWorkOrderSearch]);
    useEffect(() => { if (debouncedUnitSearch) fetchDropdownData('units', setUnits, debouncedUnitSearch); }, [debouncedUnitSearch]);
    useEffect(() => { if (debouncedSequenceSearch) fetchDropdownData('sequences', setSequences, debouncedSequenceSearch); }, [debouncedSequenceSearch]);
    useEffect(() => { if (debouncedManNonConSearch) fetchDropdownData('manufact-noncons', setManNonCons, debouncedManNonConSearch); }, [debouncedManNonConSearch]);

    //Auto-save draft to localStorage whenever fields change 
    useEffect(() => {
        // Avoid saving initial empty state
        if (loading) return;
        const data = { 
            divisionId, partNumId, drawingId, workOrderId, unitId, sequenceId, manNonConId, description, images,
            divisionSearch, partSearch, drawingSearch, workOrderSearch, unitSearch, sequenceSearch, manNonConSearch
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [
        divisionId, partNumId, drawingId, workOrderId, unitId, sequenceId, manNonConId, description, images, loading,
        divisionSearch, partSearch, drawingSearch, workOrderSearch, unitSearch, sequenceSearch, manNonConSearch
    ]);
    
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

            // Dispatch an event to tell ticket list that a ticket was created
            window.dispatchEvent(new CustomEvent('ticketCreated'));
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
        setPartNumId('');
        setDrawingId('');
        setWorkOrderId('');
        setUnitId('');
        setSequenceId('');
        setManNonConId('');
        setDescription('');
        setImages([]);
        localStorage.removeItem(STORAGE_KEY);
        
        setDivisionSearch('');
        setPartSearch('');
        setDrawingSearch('');
        setWorkOrderSearch('');
        setUnitSearch('');
        setSequenceSearch('');
        setManNonConSearch('');

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
            <input
                list="division-list"
                value={divisionSearch}
                onChange={(e) => {
                    setDivisionSearch(e.target.value);
                    const selected = divisions.find(d => d.divisionName === e.target.value);
                    setDivisionId(selected ? String(selected.divisionId) : '');
                }}
                onFocus={() => !divisionSearch && fetchDropdownData('divisions', setDivisions)}
                placeholder="Search or select a division"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
            <datalist id="division-list">
                {divisions.map((d) => <option key={d.divisionId} value={d.divisionName} />)}
            </datalist>
        </div>

        {/* Part Dropdown */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Part #</label>
            <input
                list="part-list"
                value={partSearch}
                onChange={(e) => {
                    setPartSearch(e.target.value);
                    const selected = parts.find(p => p.partNum === e.target.value);
                    setPartNumId(selected ? String(selected.partNumId) : '');
                }}
                onFocus={() => !partSearch && fetchDropdownData('parts', setParts)}
                placeholder="Search or select a part"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
            <datalist id="part-list">
                {parts.map((p) => <option key={p.partNumId} value={p.partNum} />)}
            </datalist>
        </div>

        {/* Drawing Dropdown */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Drawing #</label>
            <input
                list="drawing-list"
                value={drawingSearch}
                onChange={(e) => {
                    setDrawingSearch(e.target.value);
                    const selected = drawings.find(d => d.drawing_num === e.target.value);
                    setDrawingId(selected ? String(selected.drawingId) : '');
                }}
                onFocus={() => !drawingSearch && fetchDropdownData('drawings', setDrawings)}
                placeholder="Search or select a drawing"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
            <datalist id="drawing-list">
                {drawings.map((d) => <option key={d.drawingId} value={d.drawing_num} />)}
            </datalist>
        </div>

        {/* Work Order Dropdown */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Work Order</label>
            <input
                list="workorder-list"
                value={workOrderSearch}
                onChange={(e) => {
                    setWorkOrderSearch(e.target.value);
                    const selected = workOrders.find(wo => String(wo.wo) === e.target.value);
                    setWorkOrderId(selected ? String(selected.woId) : '');
                }}
                onFocus={() => !workOrderSearch && fetchDropdownData('work-orders', setWorkOrders)}
                placeholder="Search or select a work order"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
            <datalist id="workorder-list">
                {workOrders.map((wo) => <option key={wo.woId} value={wo.wo} />)}
            </datalist>
        </div>

        {/* Unit Dropdown */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Unit</label>
            <input
                list="unit-list"
                value={unitSearch}
                onChange={(e) => {
                    setUnitSearch(e.target.value);
                    const selected = units.find(u => u.unitName === e.target.value);
                    setUnitId(selected ? String(selected.unitId) : '');
                }}
                onFocus={() => !unitSearch && fetchDropdownData('units', setUnits)}
                placeholder="Search or select a unit"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
            <datalist id="unit-list">
                {units.map((u) => <option key={u.unitId} value={u.unitName} />)}
            </datalist>
        </div>

        {/* Sequence Dropdown */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Sequence</label>
            <input
                list="sequence-list"
                value={sequenceSearch}
                onChange={(e) => {
                    setSequenceSearch(e.target.value);
                    const selected = sequences.find(s => s.seqName === e.target.value);
                    setSequenceId(selected ? String(selected.seqID) : '');
                }}
                onFocus={() => !sequenceSearch && fetchDropdownData('sequences', setSequences)}
                placeholder="Search or select a sequence"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
            <datalist id="sequence-list">
                {sequences.map((s) => <option key={s.seqID} value={s.seqName} />)}
            </datalist>
        </div>

        {/* Manufacturing Nonconformance Dropdown */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Manufacturing Nonconformance</label>
            <input
                list="noncon-list"
                value={manNonConSearch}
                onChange={(e) => {
                    setManNonConSearch(e.target.value);
                    const selected = manNonCons.find(m => m.nonCon === e.target.value);
                    setManNonConId(selected ? String(selected.nonConId) : '');
                }}
                onFocus={() => !manNonConSearch && fetchDropdownData('manufact-noncons', setManNonCons)}
                placeholder="Search or select a nonconformance"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
            <datalist id="noncon-list">
                {manNonCons.map((m) => <option key={m.nonConId} value={m.nonCon} />)}
            </datalist>
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
