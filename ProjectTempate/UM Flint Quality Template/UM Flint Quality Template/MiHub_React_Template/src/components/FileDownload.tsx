import React, { useEffect, useState } from "react";
import { api } from "../api"; 
import {
  FileText, FileImage, FileArchive, FileSpreadsheet, FileType, File,
} from "lucide-react";
import FilePreviewModal, { PreviewType } from "./FilePreviewModal";
import { useToast } from "../hooks/use-toast";
import { logAudit } from "./utils/auditLogger";


interface FileMeta {
  fileKey: string;
  name: string;
  mimeType: string;
  size: number;
}

interface FileDownloadProps {
  ticketId: number;
  deleteMode?: boolean;
  setDeleteMode?: React.Dispatch<React.SetStateAction<boolean>>;
}


const FileDownload: React.FC<FileDownloadProps> = ({ ticketId, deleteMode, setDeleteMode }) => {
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewingFile, setPreviewingFile] = useState<FileMeta | null>(null);
  const [previewType, setPreviewType] = useState<PreviewType>("other");
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [deletingFileKey, setDeletingFileKey] = useState<string | null>(null);

  const { toast } = useToast();


  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const response = await api.get<FileMeta[]>(`/files/ticket/${ticketId}`);
        setFiles(response.data);
      } catch (err) {
        console.error("Error fetching files:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [ticketId]);

  useEffect(() => {
    if (!deleteMode) {
      setDeletingFileKey(null);
    }
  }, [deleteMode]);


  const handleDownload = async (fileKey: string, fileName: string) => {
    try {
      const response = await api.get(`/files/${fileKey}`, { responseType: "blob" });
      const blob = response.data as Blob;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  const handleDelete = async (fileKey: string, fileName: string) => {
    try {
      await api.delete(`/files/${fileKey}`);
      setFiles(prev => prev.filter(f => f.fileKey !== fileKey));
      setDeletingFileKey(null);

      toast({
        title: "File Deleted",
        description: `${fileName} was removed successfully.`,
        variant: "default",
      });

      if (setDeleteMode) setDeleteMode(false);

    } catch (err: any) {
      console.error("Delete failed", err);
      toast({
        title: "Error",
        description: `Failed to delete ${fileName}.`,
        variant: "destructive",
      });
    }
  };


  const extractFileName = (fileKey: string) => {
    const parts = fileKey.split("_");
    return parts.length >= 3 ? parts.slice(2).join("_") : fileKey;
  };

  const inferPreviewType = (file: FileMeta, blob?: Blob | null): PreviewType => {
    const name = extractFileName(file.fileKey).toLowerCase();
    const type = blob?.type || file.mimeType?.toLowerCase() || "";
    if (type.startsWith("image/")) return "image";
    if (type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
    if (type.includes("excel") || type.includes("spreadsheet") || name.endsWith(".xlsx") || name.endsWith(".xls")) return "excel";
    if (type.includes("word") || name.endsWith(".docx") || name.endsWith(".doc")) return "word";
    return "other";
  };

  const getFileIcon = (file: FileMeta) => {
    const name = extractFileName(file.fileKey).toLowerCase();
    const type = file.mimeType?.toLowerCase() || "";
    if (type.startsWith("image/")) return { Icon: FileImage, color: "text-gray-500" };
    if (type === "application/pdf" || name.endsWith(".pdf")) return { Icon: FileText, color: "text-red-500" };
    if (type.includes("word") || name.endsWith(".docx") || name.endsWith(".doc")) return { Icon: FileType, color: "text-blue-500" };
    if (type.includes("excel") || type.includes("spreadsheet") || name.endsWith(".xlsx") || name.endsWith(".xls")) return { Icon: FileSpreadsheet, color: "text-green-500" };
    if (name.endsWith(".txt") || type === "text/plain") return { Icon: FileText, color: "text-blue-400" };
    if (type.includes("zip") || name.endsWith(".zip") || name.endsWith(".rar")) return { Icon: FileArchive, color: "text-yellow-600" };
    return { Icon: File, color: "text-gray-500" };
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handlePreview = async (file: FileMeta) => {
    setPreviewingFile(file);
    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewBlob(null);
    setPreviewUrl(null);
    try {
      const response = await api.get(`/files/${file.fileKey}`, { responseType: "blob" });
      const blob = response.data as Blob;
      const url = URL.createObjectURL(blob);
      setPreviewBlob(blob);
      setPreviewUrl(url);
      setPreviewType(inferPreviewType(file, blob));
    } catch (err: any) {
      setPreviewError(err.message || "Unable to load preview.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewingFile(null);
    setPreviewBlob(null);
    setPreviewUrl(null);
    setPreviewError(null);
  };

  if (loading) return <p>Loading files...</p>;

  return (
    <div className="mt-4">
      {deleteMode && (
        <div className="mb-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
          Delete Mode Active: Click on a file to remove it.
        </div>
      )}

      {files.length === 0 ? (
        <p className="text-gray-500">No files uploaded for this ticket.</p>
      ) : (
        <ul className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
          {files.map(f => {
            const { Icon, color } = getFileIcon(f);
            return (
              <li key={f.fileKey} className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-100 p-3 rounded shadow-sm gap-2">
                <div className="flex items-center space-x-3">
                  <Icon className={`w-6 h-6 ${color}`} />
                  <div className="min-w-0">
                    <span className="block font-medium break-words">{extractFileName(f.fileKey)}</span>
                    <span className="text-xs text-gray-500">{formatSize(f.size)}</span>
                  </div>

                </div>
                <div className="flex flex-wrap justify-end gap-3">
                  {deleteMode ? (
                    deletingFileKey === f.fileKey ? (
                      <>
                        <button
                          onClick={() => handleDelete(f.fileKey, extractFileName(f.fileKey))}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700"
                        >
                          Confirm Delete
                        </button>
                        <button
                          onClick={() => setDeletingFileKey(null)}
                          className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setDeletingFileKey(f.fileKey)}
                        className="text-red-500 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    )
                  ) : (
                    <>
                      <button
                        onClick={() => handlePreview(f)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleDownload(f.fileKey, extractFileName(f.fileKey))}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Download
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {previewingFile && (
        <FilePreviewModal
          isOpen={Boolean(previewingFile)}
          onClose={closePreview}
          fileName={extractFileName(previewingFile.fileKey)}
          previewType={previewType}
          blob={previewBlob}
          blobUrl={previewUrl}
          loading={previewLoading}
          error={previewError}
        />
      )}
    </div>
  );
};

export default FileDownload;