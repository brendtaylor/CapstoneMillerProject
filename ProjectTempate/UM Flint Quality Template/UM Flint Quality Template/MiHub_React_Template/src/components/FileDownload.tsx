import React, { useEffect, useState } from "react";
import {
  FileText,
  FileImage,
  FileArchive,
  FileSpreadsheet,
  FileType,
  File,
} from "lucide-react";

interface FileMeta {
  fileKey: string;
  name: string;
  mimeType: string;
  size: number;
}

interface FileDownloadProps {
  ticketId: number;
}

const FileDownload: React.FC<FileDownloadProps> = ({ ticketId }) => {
    const [files, setFiles] = useState<FileMeta[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
    const fetchFiles = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3000/api/files/ticket/${ticketId}`);
            if (!res.ok) throw new Error("Failed to fetch files");
                const data = await res.json();
                setFiles(data);
            } catch (err) {
                console.error("Error fetching files:", err);
            } finally {
                setLoading(false);
        }
    };
    fetchFiles();
    }, [ticketId]);

    const handleDownload = async (fileKey: string, fileName: string) => {
        const res = await fetch(`http://localhost:3000/api/files/${fileKey}`);
        if (!res.ok) {
            console.error("Download failed");
            return;
        }
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const extractFileName = (fileKey: string) => {
        const parts = fileKey.split("_");
        return parts.length >= 3 ? parts.slice(2).join("_") : fileKey;
    };

    const getFileIcon = (file: FileMeta) => {
    const name = extractFileName(file.fileKey).toLowerCase();
    const type = file.mimeType?.toLowerCase() || "";

    if (type.startsWith("image/")) {
        return { Icon: FileImage, color: "text-gray-500" };
    }
    if (type === "application/pdf" || name.endsWith(".pdf")) {
        return { Icon: FileText, color: "text-red-500" };
    }
    if (type.includes("word") || name.endsWith(".docx") || name.endsWith(".doc")) {
        return { Icon: FileType, color: "text-blue-500" };
    }
    if (
        type.includes("excel") ||
        type.includes("spreadsheet") ||
        name.endsWith(".xlsx") ||
        name.endsWith(".xls")
    ) {
        return { Icon: FileSpreadsheet, color: "text-green-500" };
    }
    if (name.endsWith(".txt") || type === "text/plain") {
        return { Icon: FileText, color: "text-blue-400" };
    }
    if (type.includes("zip") || name.endsWith(".zip") || name.endsWith(".rar")) {
        return { Icon: FileArchive, color: "text-yellow-600" };
    }
    //if (type === "text/javascript" || name.endsWith(".js")) {
    //  return { Icon: FileType, color: "text-purple-500" };
    //}

    return { Icon: File, color: "text-gray-500" };
    };




    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    if (loading) return <p>Loading files...</p>;

    
  return (
    <div className="mt-4">
      {files.length === 0 ? (
        <p className="text-gray-500">No files uploaded for this ticket.</p>
      ) : (
        <ul className="space-y-2">
          {files.map((f) => {
            const { Icon, color } = getFileIcon(f);
            return (
              <li
                key={f.fileKey}
                className="flex items-center justify-between bg-gray-100 p-3 rounded shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-6 h-6 ${color}`} />
                  <div>
                    <span className="block font-medium">{extractFileName(f.fileKey)}</span>
                    <span className="text-xs text-gray-500">{formatSize(f.size)}</span>
                  </div>
                </div>
                
                <button onClick={() => handleDownload(f.fileKey, extractFileName(f.fileKey))} className="text-blue-600 hover:text-blue-800 font-medium">Download</button>

              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FileDownload;
