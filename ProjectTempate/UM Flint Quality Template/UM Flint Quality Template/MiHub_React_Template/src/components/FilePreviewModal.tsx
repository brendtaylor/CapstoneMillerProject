import React, { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { renderAsync } from "docx-preview";
import {
  GlobalWorkerOptions,
  getDocument,
  PDFDocumentProxy,
} from "pdfjs-dist";
const pdfWorkerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

type PreviewType = "pdf" | "image" | "excel" | "word" | "other";

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  previewType: PreviewType;
  blob: Blob | null;
  blobUrl: string | null;
  loading: boolean;
  error?: string | null;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  fileName,
  previewType,
  blob,
  blobUrl,
  loading,
  error,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const docxRef = useRef<HTMLDivElement | null>(null);
  const [excelHtml, setExcelHtml] = useState<string>("");

  const title = useMemo(
    () => `Preview: ${fileName || "File"}`,
    [fileName]
  );

  useEffect(() => {
    if (!isOpen || previewType !== "pdf" || !blob || !canvasRef.current) return;

    let pdfDoc: PDFDocumentProxy | null = null;

    const renderPdf = async () => {
      const data = await blob.arrayBuffer();
      pdfDoc = await getDocument({ data }).promise;
      const page = await pdfDoc.getPage(1);
      const viewport = page.getViewport({ scale: 1.2 });
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport }).promise;
    };

    renderPdf();

    return () => {
      if (pdfDoc) {
        pdfDoc.cleanup();
        pdfDoc.destroy();
      }
    };
  }, [blob, isOpen, previewType]);

  useEffect(() => {
    if (!isOpen || previewType !== "excel" || !blob) return;
    const buildHtml = async () => {
      const buffer = await blob.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheet = workbook.SheetNames[0];
      if (!firstSheet) {
        setExcelHtml("<p>No sheets found in workbook.</p>");
        return;
      }
      const sheet = workbook.Sheets[firstSheet];
      const html = XLSX.utils.sheet_to_html(sheet);
      setExcelHtml(
        html.replace(
          "<table",
          "<table class='w-full text-sm border border-gray-200 border-collapse' "
        )
      );
    };
    buildHtml();
  }, [blob, isOpen, previewType]);

  useEffect(() => {
    if (!isOpen || previewType !== "word" || !blob || !docxRef.current) return;
    const node = docxRef.current;
    node.innerHTML = "";
    renderAsync(blob, node).catch(() => {
      node.innerHTML = "<p class='text-red-600'>Unable to render document.</p>";
    });
  }, [blob, isOpen, previewType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-5xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              {previewType.toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold hover:bg-gray-200"
            aria-label="Close preview"
          >
            ×
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[75vh] bg-gray-50">
          {loading && (
            <p className="text-sm text-gray-700">Loading preview...</p>
          )}
          {!loading && error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {!loading && !error && (
            <>
              {previewType === "pdf" && (
                <div className="flex flex-col gap-3">
                  <canvas
                    ref={canvasRef}
                    className="max-h-[70vh] mx-auto border border-gray-200 shadow-sm"
                  />
                  {blobUrl && (
                    <a
                      href={blobUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      Open full PDF in new tab
                    </a>
                  )}
                </div>
              )}

              {previewType === "image" && blobUrl && (
                <div className="flex justify-center">
                  <img
                    src={blobUrl}
                    alt={fileName}
                    className="max-h-[70vh] rounded shadow"
                  />
                </div>
              )}

              {previewType === "excel" && (
                <div
                  className="bg-white p-3 rounded border border-gray-200 overflow-auto"
                  dangerouslySetInnerHTML={{ __html: excelHtml }}
                />
              )}

              {previewType === "word" && (
                <div className="bg-white p-3 rounded border border-gray-200">
                  <div ref={docxRef} className="prose max-w-none" />
                </div>
              )}

              {previewType === "other" && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    Preview is not supported for this file type. Use the button
                    below to open it with your default viewer.
                  </p>
                  {blobUrl && (
                    <a
                      href={blobUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-blue-600 underline"
                    >
                      Open in new tab
                    </a>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export type { PreviewType };
export default FilePreviewModal;
