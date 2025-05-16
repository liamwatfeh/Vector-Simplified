import React, { createContext, useContext, useState, useEffect } from 'react';
import { Folder } from '../types';
import { useAuth } from './AuthContext';
import { getFolders } from '../services/pineconeService';

interface FoldersContextType {
  folders: Record<string, Folder[]>;
  refreshFolders: (projectId?: string) => Promise<void>;
}

const FoldersContext = createContext<FoldersContextType | undefined>(undefined);

export const useFolders = () => {
  const context = useContext(FoldersContext);
  if (!context) {
    throw new Error('useFolders must be used within a FoldersProvider');
  }
  return context;
};

export const FoldersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [folders, setFolders] = useState<Record<string, Folder[]>>({});

  const refreshFolders = async (projectId?: string) => {
    if (!user?.apiKey) return;

    try {
      if (projectId) {
        const projectFolders = await getFolders(user.apiKey, projectId);
        setFolders(prev => ({
          ...prev,
          [projectId]: projectFolders
        }));
      } else {
        // Refresh all project folders
        const updatedFolders: Record<string, Folder[]> = {};
        await Promise.all(
          Object.keys(folders).map(async (pid) => {
            updatedFolders[pid] = await getFolders(user.apiKey!, pid);
          })
        );
        setFolders(updatedFolders);
      }
    } catch (error) {
      console.error('Failed to refresh folders:', error);
    }
  };

  return (
    <FoldersContext.Provider value={{ folders, refreshFolders }}>
      {children}
    </FoldersContext.Provider>
  );
};