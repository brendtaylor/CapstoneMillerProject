// src/components/UploadModal.tsx
import { getFileIcon, uploadFiles } from "./utils/fileHelper";
import { useFileHelper } from "../hooks/useFileHelper";
import { useToast } from "../hooks/use-toast";
import { logAudit } from "./utils/auditLogger";
import { useAuth } from './AuthContext';


interface UploadModalProps {
  show: boolean;
  onClose: () => void;
  ticketId: number;
  workOrderSearch: string;
}

export default function UploadModal({ show, onClose, ticketId, workOrderSearch }: UploadModalProps) {
  const { files, setFiles, handleFileUpload } = useFileHelper();
  const { toast } = useToast();
  const { userId } = useAuth();

  if (!show) return null;

  const handleDone = async () => {
    try {
      const results = await uploadFiles(ticketId, files.map(f => f.file));

      // Mark uploaded files
      setFiles(prev =>
        prev.map(f =>
          results.find(r => r.fileKey.includes(f.name))
            ? { ...f, uploaded: true }
            : f
        )
      );

      toast({title: "Upload Successful", description: `${results.length} file(s) uploaded successfully.`, variant: "default",});

      if (userId) {
        await logAudit (userId, "File Uploaded", ticketId, parseInt(workOrderSearch, 10));
      }

      // Refresh page after upload
      window.location.reload();
    } catch (err: any) {
      toast({
        title: "Upload Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      onClose();
    }
  };

  const handleClose = () => {
    setFiles([]); // clear files
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">Upload Files</h3>

        {/* Upload UI */}
        <div
          className="flex flex-col items-center justify-center space-y-2 border-2 border-dashed border-gray-300 p-6 rounded cursor-pointer "
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const droppedFiles = Array.from(e.dataTransfer.files);
            handleFileUpload(droppedFiles);
          }}
        >
          <label htmlFor="FileUpload" className="cursor-pointer flex flex-col items-center">
            <img src="/icons/upload-icon.png" alt="Upload Icon" className="w-65 h-56 mb-2" />
            <span className="text-blue-600 hover:text-blue-800 text-lg font-medium">
              Upload or Drag Files
            </span>
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

        {/* Modal Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Close
          </button>
          <button
            onClick={handleDone}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
