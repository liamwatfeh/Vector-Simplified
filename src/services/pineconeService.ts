import axios from 'axios';
import { 
  Project, 
  Folder, 
  Document, 
  CreateProjectPayload, 
  CreateFolderPayload,
  UploadDocumentPayload
} from '../types';

// Create axios instance with auth interceptor
const createApiClient = (apiKey: string) => {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
  });
  
  return client;
};

// Validate API key
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const client = createApiClient(apiKey);
    await client.get('/auth/validate');
    return true;
  } catch (error) {
    console.error('API key validation error:', error);
    return false;
  }
};

// Get all projects
export const getProjects = async (apiKey: string): Promise<Project[]> => {
  try {
    const client = createApiClient(apiKey);
    const response = await client.get('/projects');
    return response.data;
  } catch (error) {
    console.error('Get projects error:', error);
    throw error;
  }
};

// Create a new project
export const createProject = async (
  apiKey: string,
  payload: CreateProjectPayload
): Promise<Project> => {
  try {
    const client = createApiClient(apiKey);
    const response = await client.post('/projects', payload);
    return response.data;
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
    const client = createApiClient(apiKey);
    const response = await client.get(`/projects/${projectId}`);
    return response.data;
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
    const client = createApiClient(apiKey);
    const response = await client.get(`/projects/${projectId}/folders`);
    return response.data;
  } catch (error) {
    console.error('Get folders error:', error);
    throw error;
  }
};

// Create a new folder
export const createFolder = async (
  apiKey: string,
  payload: CreateFolderPayload
): Promise<Folder> => {
  try {
    const client = createApiClient(apiKey);
    const response = await client.post(`/projects/${payload.projectId}/folders`, payload);
    return response.data;
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
    const client = createApiClient(apiKey);
    const response = await client.get(`/projects/${projectId}/folders/${folderId}`);
    return response.data;
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
    const client = createApiClient(apiKey);
    const response = await client.get(`/projects/${projectId}/folders/${folderId}/documents`);
    return response.data;
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
    const client = createApiClient(apiKey);
    const formData = new FormData();
    formData.append('file', payload.file);
    
    const response = await client.post(
      `/projects/${payload.projectId}/folders/${payload.folderId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data;
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
): Promise<void> => {
  try {
    const client = createApiClient(apiKey);
    await client.delete(`/projects/${projectId}/folders/${folderId}/documents/${documentId}`);
  } catch (error) {
    console.error('Delete document error:', error);
    throw error;
  }
};