import type { DocumentChunk, UploadedDocument } from "../types/document";

const MAX_TEXT_FILE_SIZE = 2 * 1024 * 1024;
const CHUNK_SIZE = 2400;
const CHUNK_OVERLAP = 240;
const MAX_SELECTED_CHUNKS = 6;
const MAX_CONTEXT_CHARS = 14000;

const SUPPORTED_TEXT_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "application/xml",
  "text/xml",
]);

const SUPPORTED_EXTENSIONS = [
  ".txt",
  ".md",
  ".markdown",
  ".csv",
  ".json",
  ".xml",
  ".log",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".vue",
  ".css",
  ".html",
];

export const ACCEPTED_DOCUMENT_TYPES =
  "text/plain,text/markdown,text/csv,application/json,application/xml,text/xml,.txt,.md,.markdown,.csv,.json,.xml,.log,.ts,.tsx,.js,.jsx,.vue,.css,.html";

const normalizeText = (text: string): string =>
  text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();

const getFileExtension = (fileName: string): string => {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
};

export const validateDocumentFile = (file: File): string | null => {
  const extension = getFileExtension(file.name);
  const isSupported =
    SUPPORTED_TEXT_TYPES.has(file.type) || SUPPORTED_EXTENSIONS.includes(extension);

  if (!isSupported) {
    return "当前仅支持 txt、md、csv、json、xml 和常见代码文本文件";
  }

  if (file.size > MAX_TEXT_FILE_SIZE) {
    return "文本文件不能超过 2MB，请先拆分或压缩内容";
  }

  return null;
};

const splitIntoChunks = (
  documentId: string,
  documentName: string,
  content: string
): DocumentChunk[] => {
  const chunks: DocumentChunk[] = [];
  let start = 0;

  while (start < content.length) {
    const end = Math.min(start + CHUNK_SIZE, content.length);
    const chunkContent = content.slice(start, end).trim();

    if (chunkContent) {
      chunks.push({
        id: `${documentId}-${chunks.length}`,
        documentId,
        documentName,
        index: chunks.length + 1,
        content: chunkContent,
      });
    }

    if (end >= content.length) {
      break;
    }

    start = Math.max(end - CHUNK_OVERLAP, start + 1);
  }

  return chunks;
};

export const readDocumentFile = async (file: File): Promise<UploadedDocument> => {
  const error = validateDocumentFile(file);
  if (error) {
    throw new Error(error);
  }

  const content = normalizeText(await file.text());
  if (!content) {
    throw new Error("文件内容为空");
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const chunks = splitIntoChunks(id, file.name, content);

  return {
    id,
    name: file.name,
    type: file.type || "text/plain",
    size: file.size,
    createdAt: new Date().toISOString(),
    content,
    chunks,
  };
};

const tokenize = (text: string): Set<string> => {
  const tokens = text
    .toLowerCase()
    .split(/[^\p{L}\p{N}_]+/u)
    .filter((token) => token.length >= 2);

  return new Set(tokens);
};

const scoreChunk = (chunk: DocumentChunk, queryTokens: Set<string>): number => {
  if (queryTokens.size === 0) {
    return 1;
  }

  const content = chunk.content.toLowerCase();
  let score = 0;

  queryTokens.forEach((token) => {
    if (content.includes(token)) {
      score += token.length > 3 ? 2 : 1;
    }
  });

  return score;
};

export const buildDocumentContext = (
  documents: UploadedDocument[],
  query: string
): string => {
  const queryTokens = tokenize(query);
  const rankedChunks = documents
    .flatMap((document) => document.chunks)
    .map((chunk) => ({
      chunk,
      score: scoreChunk(chunk, queryTokens),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.chunk.index - b.chunk.index)
    .slice(0, MAX_SELECTED_CHUNKS)
    .map((item) => item.chunk);

  if (rankedChunks.length === 0) {
    return "";
  }

  let remainingChars = MAX_CONTEXT_CHARS;
  const sections: string[] = [];

  for (const chunk of rankedChunks) {
    if (remainingChars <= 0) {
      break;
    }

    const header = `文件：${chunk.documentName}，片段 ${chunk.index}`;
    const content = chunk.content.slice(0, remainingChars);
    sections.push(`### ${header}\n${content}`);
    remainingChars -= content.length;
  }

  return `以下是用户上传文件中与当前问题最相关的片段。请优先基于这些片段回答；如果片段不足，请明确说明。\n\n${sections.join(
    "\n\n---\n\n"
  )}`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};
