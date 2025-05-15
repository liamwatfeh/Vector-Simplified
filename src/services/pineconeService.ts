import axios from 'axios';
import { 
  Project, 
  Folder, 
  Document, 
  CreateProjectPayload, 
  CreateFolderPayload,
  UploadDocumentPayload
} from '../types';

// Mock API base URL (would be replaced with actual Pinecone API)
const API_BASE_URL = 'https://api.pinecone.io';

// Create axios instance with auth interceptor
const createApiClient = (apiKey: string) => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': apiKey,
    },
  });
  
  return client;
};

// Validate API key
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    // In a real implementation, we would make an actual API call
    // For demo, we'll simulate a successful validation
    console.log('Validating API key:', apiKey);
    
    // Mock API validation - in production, this would call the Pinecone API
    return apiKey.length > 10; // Simple validation for demo purposes
  } catch (error) {
    console.error('API key validation error:', error);
    return false;
  }
};

// Get all projects (indexes)
export const getProjects = async (apiKey: string): Promise<Project[]> => {
  try {
    // Simulate API call for demo purposes
    return [
      {
        id: 'project-1',
        name: 'Customer Support',
        createdAt: '2025-05-01T12:00:00Z',
        folderCount: 3,
        documentCount: 12
      },
      {
        id: 'project-2',
        name: 'Legal Documents',
        createdAt: '2025-04-15T09:30:00Z',
        folderCount: 2,
        documentCount: 8
      },
      {
        id: 'project-3',
        name: 'Product Knowledge Base',
        createdAt: '2025-04-01T16:45:00Z',
        folderCount: 4,
        documentCount: 25
      }
    ];
  } catch (error) {
    console.error('Get projects error:', error);
    throw error;
  }
};

// Create a new project (index)
export const createProject = async (
  apiKey: string,
  payload: CreateProjectPayload
): Promise<Project> => {
  try {
    // Simulate API call for demo purposes
    return {
      id: `project-${Date.now()}`,
      name: payload.name,
      createdAt: new Date().toISOString(),
      folderCount: 0,
      documentCount: 0
    };
  } catch (error) {
    console.error('Create project error:', error);
    throw error;
  }
};

// Get project details
export const getProject = async (
  apiKey: string,
  projectId: string
): Promise<Project> => {
  try {
    // Simulate API call for demo purposes
    return {
      id: projectId,
      name: 'Customer Support',
      createdAt: '2025-05-01T12:00:00Z',
      folderCount: 3,
      documentCount: 12
    };
  } catch (error) {
    console.error('Get project error:', error);
    throw error;
  }
};

// Get folders in a project
export const getFolders = async (
  apiKey: string,
  projectId: string
): Promise<Folder[]> => {
  try {
    // Simulate API call for demo purposes
    return [
      {
        id: 'folder-1',
        name: 'FAQ Documents',
        projectId,
        chunkSize: 1000,
        chunkOverlap: 200,
        metadataParams: ['category', 'author'],
        createdAt: '2025-05-05T10:15:00Z',
        documentCount: 5
      },
      {
        id: 'folder-2',
        name: 'Support Tickets',
        projectId,
        chunkSize: 500,
        chunkOverlap: 100,
        metadataParams: ['priority', 'status'],
        createdAt: '2025-05-03T14:30:00Z',
        documentCount: 4
      },
      {
        id: 'folder-3',
        name: 'Training Materials',
        projectId,
        chunkSize: 1500,
        chunkOverlap: 300,
        metadataParams: ['module', 'level'],
        createdAt: '2025-05-02T09:45:00Z',
        documentCount: 3
      }
    ];
  } catch (error) {
    console.error('Get folders error:', error);
    throw error;
  }
};

// Create a new folder (namespace)
export const createFolder = async (
  apiKey: string,
  payload: CreateFolderPayload
): Promise<Folder> => {
  try {
    // Simulate API call for demo purposes
    return {
      id: `folder-${Date.now()}`,
      name: payload.name,
      projectId: payload.projectId,
      chunkSize: payload.chunkSize,
      chunkOverlap: payload.chunkOverlap,
      metadataParams: payload.metadataParams,
      createdAt: new Date().toISOString(),
      documentCount: 0
    };
  } catch (error) {
    console.error('Create folder error:', error);
    throw error;
  }
};

// Get folder details
export const getFolder = async (
  apiKey: string,
  projectId: string,
  folderId: string
): Promise<Folder> => {
  try {
    // Simulate API call for demo purposes
    return {
      id: folderId,
      name: 'FAQ Documents',
      projectId,
      chunkSize: 1000,
      chunkOverlap: 200,
      metadataParams: ['category', 'author'],
      createdAt: '2025-05-05T10:15:00Z',
      documentCount: 5
    };
  } catch (error) {
    console.error('Get folder error:', error);
    throw error;
  }
};

// Get documents in a folder
export const getDocuments = async (
  apiKey: string,
  projectId: string,
  folderId: string
): Promise<Document[]> => {
  try {
    // Simulate API call for demo purposes
    return [
      {
        id: 'doc-1',
        name: 'Product Manual.pdf',
        folderId,
        projectId,
        status: 'completed',
        createdAt: '2025-05-10T11:20:00Z',
        fileSize: 2500000,
        vectorCount: 47
      },
      {
        id: 'doc-2',
        name: 'Troubleshooting Guide.pdf',
        folderId,
        projectId,
        status: 'completed',
        createdAt: '2025-05-09T15:45:00Z',
        fileSize: 1800000,
        vectorCount: 32
      },
      {
        id: 'doc-3',
        name: 'User Instructions.pdf',
        folderId,
        projectId,
        status: 'processing',
        createdAt: '2025-05-11T09:30:00Z',
        fileSize: 3200000
      },
      {
        id: 'doc-4',
        name: 'Error Codes.pdf',
        folderId,
        projectId,
        status: 'error',
        createdAt: '2025-05-08T14:15:00Z',
        fileSize: 1200000,
        errorMessage: 'Failed to extract text from document'
      }
    ];
  } catch (error) {
    console.error('Get documents error:', error);
    throw error;
  }
};

// Upload document
export const uploadDocument = async (
  apiKey: string,
  payload: UploadDocumentPayload
): Promise<Document> => {
  try {
    // In a real implementation, we would upload the file and initiate processing
    // For demo, we'll simulate a document being created in "processing" state
    
    return {
      id: `doc-${Date.now()}`,
      name: payload.file.name,
      folderId: payload.folderId,
      projectId: payload.projectId,
      status: 'processing',
      createdAt: new Date().toISOString(),
      fileSize: payload.file.size
    };
  } catch (error) {
    console.error('Upload document error:', error);
    throw error;
  }
};

// Delete document
export const deleteDocument = async (
  apiKey: string,
  projectId: string,
  folderId: string,
  documentId: string
): Promise<boolean> => {
  try {
    // Simulate API call for demo purposes
    return true;
  } catch (error) {
    console.error('Delete document error:', error);
    throw error;
  }
};