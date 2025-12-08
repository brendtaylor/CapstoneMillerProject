// src/components/utils/fileHelper.ts
import { FileText, FileImage, FileArchive, FileSpreadsheet, FileType, File } from "lucide-react";
import { api, API_BASE_URL } from "../../api"; 

export const getFileIcon = (previewType: string) => {
  switch (previewType) {
    case "image": return FileImage;
    case "pdf": return FileText;
    case "doc": return FileType;
    case "excel": return FileSpreadsheet;
    case "txt": return FileText;
    case "zip": return FileArchive;
    default: return File;
  }
};

const MAX_FILES = 10;
export { MAX_FILES };

export function validateFileCount(currentCount: number, newCount: number): void {
  if (currentCount + newCount > MAX_FILES) {
    throw new Error(`You can only upload up to ${MAX_FILES} files.`);
  }
}

export async function uploadFile(ticketId: number, file: File) {
  const formData = new FormData();
  const uniqueKey = `${ticketId}_${Date.now()}_${file.name}`;

  formData.append("ticketId", ticketId.toString());
  formData.append("fileKey", uniqueKey);
  formData.append("imageFile", file);

  try {
    const res = await api.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return { ...(res.data as any), fileKey: uniqueKey };
  } catch (error: any) {
    const msg = error.response?.data?.message || error.message || "Upload failed";
    throw new Error(`File upload failed: ${msg}`);
  }
}

export async function uploadFiles(ticketId: number, files: File[]) {
  const results = [];
  for (const file of files) {
    const result = await uploadFile(ticketId, file);
    results.push(result);
  }
  return results;
}

export function getImageUrl(imageKey: string): string {
  return `${API_BASE_URL}/images/${encodeURIComponent(imageKey)}`;
}

export async function deleteFile(fileKey: string) {
  try {
    const res = await api.delete(`/files/${encodeURIComponent(fileKey)}`);
    return res.data;
  } catch (error: any) {
    const msg = error.response?.data?.message || error.message || "Delete failed";
    throw new Error(`File delete failed: ${msg}`);
  }
}
