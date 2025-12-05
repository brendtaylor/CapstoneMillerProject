// src/hooks/useFileHelper.ts
import { useState } from "react";
import { useToast } from "./use-toast";
import { getFileIcon, MAX_FILES, uploadFiles } from "../components/utils/fileHelper";

export interface SavedFile {
  name: string;
  data: string;
  isFile: boolean;
  file: File;
  uploaded?: boolean;
  fileKey?: string;
  previewType: "image" | "pdf" | "doc" | "excel" | "txt" | "zip" | "other";
  color?: string;
}

export function useFileHelper() {
  const [files, setFiles] = useState<SavedFile[]>([]);
  const { toast } = useToast();

  const handleFileUpload = (fileArray: File[]) => {
    if (files.length + fileArray.length > MAX_FILES) {
      toast({
        title: "Upload Limit Reached",
        description: `You can only upload up to ${MAX_FILES} files.`,
        variant: "destructive",
      });
      return;
    }

    fileArray.forEach((file) => {
      if (file.type.startsWith("video/")) {
        toast({
          title: "Unsupported File Type",
          description: "Video files are not allowed.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        let previewType: SavedFile["previewType"] = "other";
        let color = "text-gray-500";

        if (file.type.startsWith("image/")) {
          previewType = "image";
        } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
          previewType = "pdf";
          color = "text-red-500";
        } else if (file.type.includes("word") || file.name.endsWith(".docx") || file.name.endsWith(".doc")) {
          previewType = "doc";
          color = "text-blue-500";
        } else if (
          file.type.includes("excel") ||
          file.type.includes("spreadsheet") ||
          file.name.endsWith(".xlsx") ||
          file.name.endsWith(".xls")
        ) {
          previewType = "excel";
          color = "text-green-500";
        } else if (file.name.endsWith(".txt")) {
          previewType = "txt";
          color = "text-blue-400";
        } else if (file.type.includes("zip") || file.name.endsWith(".zip") || file.name.endsWith(".rar")) {
          previewType = "zip";
          color = "text-yellow-600";
        }

        setFiles((prev) => [
          ...prev,
          {
            name: file.name,
            data: reader.result as string,
            isFile: true,
            file,
            uploaded: false,
            previewType,
            color,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  return { files, setFiles, handleFileUpload };
}
