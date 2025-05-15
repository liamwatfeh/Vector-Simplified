import axios from 'axios';
import { 
  Project, 
  Folder, 
  Document, 
  CreateProjectPayload, 
  CreateFolderPayload,
  UploadDocumentPayload
} from '../types';

// Mock data storage
let mockProjects: Project[] = [];
let mockFolders: Record<string, Folder[]> = {};
let mockDocuments: Record<string, Document[]> = {};

// Validate API key
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  // Accept any non-empty string as valid API key for demo
  return apiKey.length > 0;
};

// Get all projects
export const getProjects = async (apiKey: string): Promise<Project[]> => {
  return mockProjects;
};

// Create a new project
export const createProject = async (
  apiKey: string,
  payload: CreateProjectPayload
): Promise<Project> => {
  const newProject: Project = {
    id: `project-${Date.now()}`,
    name: payload.name,
    createdAt: new Date().toISOString(),
    folderCount: 0,
    documentCount: 0
  };
  
  mockProjects.push(newProject);
  mockFolders[newProject.id] = [];
  
  return newProject;
};

// Get project details
export const getProject = async (
  apiKey: string,
  projectId: string
): Promise<Project> => {
  const project = mockProjects.find(p => p.id === projectId);
  if (!project) throw new Error('Project not found');
  return project;
};

// Get folders in a project
export const getFolders = async (
  apiKey: string,
  projectId: string
): Promise<Folder[]> => {
  return mockFolders[projectId] || [];
};

// Create a new folder
export const createFolder = async (
  apiKey: string,
  payload: CreateFolderPayload
): Promise<Folder> => {
  const newFolder: Folder = {
    id: `folder-${Date.now()}`,
    name: payload.name,
    projectId: payload.projectId,
    chunkSize: payload.chunkSize,
    chunkOverlap: payload.chunkOverlap,
    metadataParams: payload.metadataParams,
    createdAt: new Date().toISOString(),
    documentCount: 0
  };
  
  if (!mockFolders[payload.projectId]) {
    mockFolders[payload.projectId] = [];
  }
  
  mockFolders[payload.projectId].push(newFolder);
  mockDocuments[newFolder.id] = [];
  
  // Update project folder count
  const project = mockProjects.find(p => p.id === payload.projectId);
  if (project) {
    project.folderCount += 1;
  }
  
  return newFolder;
};

// Get folder details
export const getFolder = async (
  apiKey: string,
  projectId: string,
  folderId: string
): Promise<Folder> => {
  const folder = mockFolders[projectId]?.find(f => f.id === folderId);
  if (!folder) throw new Error('Folder not found');
  return folder;
};

// Get documents in a folder
export const getDocuments = async (
  apiKey: string,
  projectId: string,
  folderId: string
): Promise<Document[]> => {
  return mockDocuments[folderId] || [];
};

// Upload document
export const uploadDocument = async (
  apiKey: string,
  payload: UploadDocumentPayload
): Promise<Document> => {
  const newDocument: Document = {
    id: `doc-${Date.now()}`,
    name: payload.file.name,
    folderId: payload.folderId,
    projectId: payload.projectId,
    status: 'processing',
    createdAt: new Date().toISOString(),
    fileSize: payload.file.size
  };
  
  if (!mockDocuments[payload.folderId]) {
    mockDocuments[payload.folderId] = [];
  }
  
  mockDocuments[payload.folderId].push(newDocument);
  
  // Update folder and project document counts
  const folder = mockFolders[payload.projectId]?.find(f => f.id === payload.folderId);
  if (folder) {
    folder.documentCount += 1;
  }
  
  const project = mockProjects.find(p => p.id === payload.projectId);
  if (project) {
    project.documentCount += 1;
  }
  
  // Simulate processing completion after 2 seconds
  setTimeout(() => {
    const doc = mockDocuments[payload.folderId].find(d => d.id === newDocument.id);
    if (doc) {
      doc.status = 'completed';
      doc.vectorCount = Math.floor(Math.random() * 50) + 10;
    }
  }, 2000);
  
  return newDocument;
};

// Delete document
export const deleteDocument = async (
  apiKey: string,
  projectId: string,
  folderId: string,
  documentId: string
): Promise<void> => {
  const documents = mockDocuments[folderId];
  if (!documents) return;
  
  const index = documents.findIndex(d => d.id === documentId);
  if (index === -1) return;
  
  documents.splice(index, 1);
  
  // Update folder and project document counts
  const folder = mockFolders[projectId]?.find(f => f.id === folderId);
  if (folder) {
    folder.documentCount -= 1;
  }
  
  const project = mockProjects.find(p => p.id === projectId);
  if (project) {
    project.documentCount -= 1;
  }
};