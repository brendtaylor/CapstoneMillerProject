// fileHelper.ts
// src/utils/fileHelper.ts
import { FileText, FileImage, FileArchive, FileSpreadsheet, FileType, File } from "lucide-react";

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

  const res = await fetch("http://localhost:3000/api/files/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`File upload failed: ${text}`);
  }

  const data = await res.json();
  return { ...data, fileKey: uniqueKey };
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
  return `http://localhost:3000/api/images/${encodeURIComponent(imageKey)}`;
}
