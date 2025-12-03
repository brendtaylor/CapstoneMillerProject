declare module "docx-preview" {
  export function renderAsync(
    blob: Blob | ArrayBuffer,
    element: HTMLElement,
    styleOptions?: unknown,
    rendererOptions?: unknown,
    renderOptions?: unknown
  ): Promise<void>;
}
