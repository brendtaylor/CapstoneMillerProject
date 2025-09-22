import React, { useState } from 'react';

//Status options of drop downs
type StatusOption = 'selectOption' | 'pending' | 'inProgress' | 'completed';
type DivisionOption = 'selectOption' | 'flex' | 'flexAir' | 'other';

const FileForm: React.FC = () => {
    const [name, setName] = useState('');
    const [status, setStatus] = useState<StatusOption>('selectOption');
    const [division, setDivision] = useState<DivisionOption>('selectOption');
    const [partNumber, setPartNumber] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState<File[]>([]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Stores images in an array 
        if (e.target.files) {
            setImages(Array.from(e.target.files));
        }
    };

    const handleSave = () => {
        // Implement how to save here
        console.log({ name, status, division, partNumber, description, images });
    };

    const handleDelete = () => {
        // Reset the form
        setName('');
        setStatus('selectOption');
        setDivision('selectOption');
        setPartNumber('');
        setDescription('');
        setImages([]);
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-md space-y-6">
        

        {/* Name of File */}
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
            <option value="selectOption" disabled>Select Option</option>
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
            <option value="selectOption" disabled>Select Option</option>
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

        {/* Upload Image Icon */}
        <div className="flex flex-col items-center justify-center space-y-2 mt-6">
            <label htmlFor="imageUpload" className="cursor-pointer flex flex-col items-center">
                <img src="/icons/upload-icon.png" alt="Upload Icon" className="w-26 h-26 mb-2"/>
                {/*<span className="text-blue-600 hover:text-blue-800 text-lg font-medium">Upload Image</span>*/}
            </label>

            {/* Hidden File Input */}
            <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
            />
            </div>


        {/* Upload Image */}
        <div>
        <label className="block text-sm font-medium text-gray-700">Upload Image</label>
        <input type="file" accept="image/*" onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
                setImages((prev) => [...prev, e.target.files![0]]);
            }
            }}
            className="mt-1 block w-full"/> {images.length > 0 && (<ul className="mt-2 space-y-2 text-sm text-gray-700"> {images.map((file, index) => ( <li key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded"> <span>{file.name}</span>
        <button onClick={() => {setImages((prev) => prev.filter((_, i) => i !== index));}} className="text-red-500 hover:text-red-700">
            Remove
        </button></li>))}</ul>)}
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
