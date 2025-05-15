export interface Project {
  id: string;
  name: string;
  createdAt: string;
  folderCount: number;
  documentCount: number;
}

export interface Folder {
  id: string;
  name: string;
  projectId: string;
  chunkSize: number;
  chunkOverlap: number;
  metadataParams: string[];
  createdAt: string;
  documentCount: number;
}

export interface Document {
  id: string;
  name: string;
  folderId: string;
  projectId: string;
  status: 'processing' | 'completed' | 'error';
  createdAt: string;
  fileSize: number;
  vectorCount?: number;
  errorMessage?: string;
}

export interface User {
  apiKey: string;
}

export interface CreateProjectPayload {
  name: string;
}

export interface CreateFolderPayload {
  name: string;
  projectId: string;
  chunkSize: number;
  chunkOverlap: number;
  metadataParams: string[];
}

export interface UploadDocumentPayload {
  file: File;
  folderId: string;
  projectId: string;
}