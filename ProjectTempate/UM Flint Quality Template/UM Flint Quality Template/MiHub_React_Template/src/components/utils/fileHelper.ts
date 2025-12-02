// fileHelper.ts

const MAX_FILES = 10;

// Verify File Count
export function validateFileCount(currentCount: number, newCount: number): void {
  if (currentCount + newCount > MAX_FILES) {
    throw new Error(`You can only upload up to ${MAX_FILES} files.`);
  }
}

// Upload a File
export async function uploadFile(ticketId: number, file: File) {
  const formData = new FormData();
  const uniqueKey = `${ticketId}_${Date.now()}_${file.name}`;

  formData.append("ticketId", ticketId.toString());   // ✅ use ticketId
  formData.append("imageKey", uniqueKey);
  formData.append("imageFile", file);

  const res = await fetch("http://localhost:3000/api/images/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "File upload failed");
  }

  return { ...data, imageKey: uniqueKey };
}


export function getImageUrl(imageKey: string): string {
  return `http://localhost:3000/api/images/${encodeURIComponent(imageKey)}`;
}
