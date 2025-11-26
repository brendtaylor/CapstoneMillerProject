import { Download } from "lucide-react";

interface UploadedFile {
  name: string;
  key: string;   // unique identifier or ticketId-based key
}

function UploadedFileList({ files }: { files: UploadedFile[] }) {
  return (
    //Will likely need to reformat later, just draft for now

    <ul className="space-y-2">
      {files.map((file, idx) => (
        <li
          key={idx}
          className="flex items-center justify-between border-b pb-2"
        >
          {/* File name */}
          <span className="text-gray-800">{file.name}</span>

          {/* Download Button */}
          <a
            href={`http://localhost:3000/api/${file.key}`}
            download={file.name}
            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center"
          >
            <Download className="w-4 h-4" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export default UploadedFileList;
