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
  metadataConfig?: {
    [key: string]: {
      type: 'text' | 'number' | 'date' | 'select';
      options?: string[];
      required: boolean;
    };
  };
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
  metadata?: {
    [key: string]: string;
  };
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
  metadataConfig?: {
    [key: string]: {
      type: 'text' | 'number' | 'date' | 'select';
      options?: string[];
      required: boolean;
    };
  };
}

export interface UploadDocumentPayload {
  file: File;
  folderId: string;
  projectId: string;
  metadata?: {
    [key: string]: string;
  };
}