import React, { useState, useEffect } from 'react';

//Status options of drop downs
type StatusOption = 'selectOption' | 'pending' | 'inProgress' | 'completed';
type DivisionOption = 'selectOption' | 'flex' | 'flexAir' | 'other';


interface SavedImage {
    name: string;
    data: string; //Base64 string
}

const STORAGE_KEY = "ticketDraft";

const FileForm: React.FC = () => {
    const [name, setName] = useState('');
    const [status, setStatus] = useState<StatusOption>('selectOption');
    const [division, setDivision] = useState<DivisionOption>('selectOption');
    const [partNumber, setPartNumber] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState<SavedImage[]>([]);

    //Load draft from localStorage when component mounts
    useEffect(() => {
        const draft = localStorage.getItem(STORAGE_KEY);
        if (draft) {
            try {
            const parsed = JSON.parse(saveDraft);
            setName(parsed.name || '');
            setStatus(parsed.status || 'selectOption');
            setDivision(parsed.division || 'selectOption');
            setPartNumber(parsed.partNumber || '');
            setDescription(parsed.description || '');
            setImages(parsed.images || []);
        } catch {
                console.warn("Failed to parse draft from localStorage");
            }
        }
    },[]);

    //Auto-save draft to localStorage whenever fields change 
    useEffect(() => {
        const data = { name, status, division, partNumber, description, images };
        console.log("Auto-saving draft:", data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [name, status, division, partNumber, description, images]);
    
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


    const handleSave = () => {
        // Implement how to save here
        console.log("Saving fianl ticket:", { name, status, division, partNumber, description, images });
        alert("Ticket saved successfully!");
        handleDelete();
};

    const handleDelete = () => {
        setName('');
        setStatus('selectOption');
        setDivision('selectOption');
        setPartNumber('');
        setDescription('');
        setImages([]);
        localStorage.removeItem(STORAGE_KEY);

        const imageInput = document.getElementById('imageUpload') as HTMLInputElement;
        if (imageInput) imageInput.vaule = '';
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-md space-y-6">
        

        {/* Report Name */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Report Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder='Type Here' className="mt-1 block w-full border border-gray-300 rounded-md p-2"/>
        </div>

        {/* Status Dropdown */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusOption)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
            <option value="selectOption">Select Option</option>
            <option value="pending">Pending</option>
            <option value="inProgress">In Progress</option>
            <option value="completed">Completed</option>
            </select>
        </div>

        {/* Division Dropdown */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Division</label>
            <select
            value={division}
            onChange={(e) => setDivision(e.target.value as DivisionOption)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
            <option value="selectOption">Select Option</option>
            <option value="flex">Flex</option>
            <option value="flexAir">Flex Air</option>
            <option value="other">Other</option>
            </select>
        </div>

        {/* Part Number */}
            <div>
            <label className="block text-sm font-medium text-gray-700">Part Number</label>
            <input type="text" value={partNumber} onChange={(e) => setPartNumber(e.target.value)} placeholder='Type Here' className="mt-1 block w-full border border-gray-300 rounded-md p-2"/>
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
            <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Save
            </button>
        </div>
        </div>
  );
};

export default FileForm;
