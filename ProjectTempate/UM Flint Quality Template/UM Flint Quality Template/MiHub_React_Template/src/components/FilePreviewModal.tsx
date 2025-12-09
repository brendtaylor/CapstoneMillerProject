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
  const pdfRenderTaskRef = useRef<any>(null);
  const [excelHtml, setExcelHtml] = useState<string>("");
  const [zoom, setZoom] = useState<number>(1.0);
  const [pdfSize, setPdfSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const hasUserAdjustedZoom = useRef(false);
  const autoFitAppliedRef = useRef(false);

  const contentMaxWidth = useMemo(
    () => Math.max(320, viewportWidth - 48),
    [viewportWidth]
  );

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined")
      return;
    if (!isOpen) return;

    const { style } = document.body;
    const previousOverflow = style.overflow;
    const previousPaddingRight = style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      style.overflow = previousOverflow;
      style.paddingRight = previousPaddingRight;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    hasUserAdjustedZoom.current = false;
    autoFitAppliedRef.current = false;
  }, [isOpen, previewType]);

  const title = useMemo(
    () => `Preview: ${fileName || "File"}`,
    [fileName]
  );

  const canZoom = previewType !== "other";
  const zoomStyle = {
    transform: `scale(${zoom})`,
    transformOrigin: "top left" as const,
    transition: "transform 0.1s ease",
    width: `${100 / zoom}%`,
  };

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isOpen || previewType !== "pdf" || !blob || !canvasRef.current) return;

    let pdfDoc: PDFDocumentProxy | null = null;
    let cancelled = false;

    const renderPdf = async () => {
      if (pdfRenderTaskRef.current) {
        pdfRenderTaskRef.current.cancel();
        try {
          await pdfRenderTaskRef.current.promise;
        } catch (err: any) {
          if (err?.name !== "RenderingCancelledException") {
            throw err;
          }
        } finally {
          pdfRenderTaskRef.current = null;
        }
      }

      const data = await blob.arrayBuffer();
      if (cancelled) return;
      pdfDoc = await getDocument({ data }).promise;
      if (cancelled) return;

      const page = await pdfDoc.getPage(1);
      if (cancelled) return;
      const viewport = page.getViewport({ scale: zoom });
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      setPdfSize({ width: viewport.width, height: viewport.height });

      const renderTask = page.render({ canvasContext: context, viewport });
      pdfRenderTaskRef.current = renderTask;
      try {
        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          throw err;
        }
      } finally {
        if (pdfRenderTaskRef.current === renderTask) {
          pdfRenderTaskRef.current = null;
        }
      }
    };

    renderPdf();

    return () => {
      cancelled = true;
      if (pdfRenderTaskRef.current) {
        pdfRenderTaskRef.current.cancel();
        pdfRenderTaskRef.current = null;
      }
      if (pdfDoc) {
        pdfDoc.cleanup();
        pdfDoc.destroy();
      }
    };
  }, [blob, isOpen, previewType, zoom]);

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
          "<table class='w-full text-sm border border-gray-200 border-collapse'"
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

  useEffect(() => {
    if (!isOpen) return;
    if (hasUserAdjustedZoom.current) return;

    const baseWidth =
      previewType === "pdf" && pdfSize.width
        ? pdfSize.width
        : previewType === "excel" || previewType === "word"
        ? 900
        : 720;

    const fitZoom = Math.min(1, contentMaxWidth / baseWidth);
    const normalizedZoom = +fitZoom.toFixed(2);

    if (!autoFitAppliedRef.current && normalizedZoom > 0) {
      autoFitAppliedRef.current = true;
      setZoom(normalizedZoom);
    }
  }, [contentMaxWidth, isOpen, pdfSize.width, previewType]);

  if (!isOpen) return null;

  const pdfDisplayWidth =
    pdfSize.width && pdfSize.width < contentMaxWidth
      ? pdfSize.width
      : contentMaxWidth;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
      <div className="relative w-full max-w-full sm:max-w-5xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center border-b px-4 py-3 gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex-1 min-w-0 hidden sm:block">
            <h3 className="text-lg font-semibold text-gray-900 truncate" title={title}>
              {title}
            </h3>
            <p className="text-xs text-gray-500 uppercase tracking-wide truncate">
              {previewType.toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end flex-shrink-0 ml-auto">
            {canZoom && (
              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1 text-sm">
                <button
                  className="px-2 font-semibold hover:text-blue-600"
                  onClick={() => {
                    hasUserAdjustedZoom.current = true;
                    setZoom((z) => Math.max(0.25, +(z - 0.2).toFixed(2)));
                  }}
                  aria-label="Zoom out"
                >
                  -
                </button>
                <span className="w-14 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  className="px-2 font-semibold hover:text-blue-600"
                  onClick={() => {
                    hasUserAdjustedZoom.current = true;
                    setZoom((z) => Math.min(3, +(z + 0.2).toFixed(2)));
                  }}
                  aria-label="Zoom in"
                >
                  +
                </button>
                <button
                  className="px-2 text-xs text-gray-600 hover:text-blue-600"
                  onClick={() => {
                    hasUserAdjustedZoom.current = true;
                    setZoom(1);
                  }}
                  aria-label="Reset zoom"
                >
                  Reset
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold hover:bg-gray-200"
              aria-label="Close preview"
            >
              X
            </button>
          </div>
        </div>

        <div className="p-4 overflow-auto flex-1 min-h-0 bg-gray-50">
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
                    className="mx-auto border border-gray-200 shadow-sm"
                    style={{
                      width: pdfDisplayWidth,
                      maxWidth: "100%",
                      height: "auto",
                    }}
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
                  <div style={zoomStyle}>
                    <img
                      src={blobUrl}
                      alt={fileName}
                      className="rounded shadow max-w-full h-auto"
                    />
                  </div>
                </div>
              )}

              {previewType === "excel" && (
                <div className="bg-white p-3 rounded border border-gray-200 overflow-auto">
                  <div style={zoomStyle} dangerouslySetInnerHTML={{ __html: excelHtml }} />
                </div>
              )}

              {previewType === "word" && (
                <div className="bg-white p-3 rounded border border-gray-200 overflow-auto">
                  <div style={zoomStyle}>
                    <div ref={docxRef} className="prose max-w-none" />
                  </div>
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
        <div className="sm:hidden border-t px-4 py-3 bg-white sticky bottom-0">
          <h3 className="text-base font-semibold text-gray-900 truncate" title={title}>
            {title}
          </h3>
          <p className="text-xs text-gray-500 uppercase tracking-wide truncate">
            {previewType.toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
};

export type { PreviewType };
export default FilePreviewModal;
