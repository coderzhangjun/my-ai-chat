export interface DocumentChunk {
  id: string;
  documentId: string;
  documentName: string;
  index: number;
  content: string;
}

export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: string;
  content: string;
  chunks: DocumentChunk[];
}
