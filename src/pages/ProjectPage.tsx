import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProject, getFolders } from '../services/pineconeService';
import { Project, Folder } from '../types';
import { 
  PlusCircle, 
  Folder as FolderIcon, 
  FileText, 
  Loader2,
  Settings,
  Trash2,
  FolderOpen
} from 'lucide-react';
import CreateFolderModal from '../components/CreateFolderModal';

const ProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [project, setProject] = useState<Project | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);

  // Check if folder creation modal should be shown
  useEffect(() => {
    if (searchParams.get('new') === 'folder') {
      setShowNewFolderModal(true);
    }
  }, [searchParams]);

  // Fetch project and folder data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.apiKey || !projectId) return;
      
      setLoading(true);
      
      try {
        const [projectData, foldersData] = await Promise.all([
          getProject(user.apiKey, projectId),
          getFolders(user.apiKey, projectId)
        ]);
        
        setProject(projectData);
        setFolders(foldersData);
      } catch (error) {
        console.error('Failed to fetch project data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, projectId]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handle click on a folder
  const handleFolderClick = (folderId: string) => {
    navigate(`/projects/${projectId}/folders/${folderId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Project not found</h2>
        <p className="text-slate-600 mb-6">The project you're looking for doesn't exist or you don't have access to it.</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="btn btn-primary"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">{project.name}</h1>
          <p className="text-sm text-slate-500">
            Created {formatDate(project.createdAt)} • {project.folderCount} {project.folderCount === 1 ? 'folder' : 'folders'} • {project.documentCount} {project.documentCount === 1 ? 'document' : 'documents'}
          </p>
        </div>
        <div className="flex space-x-2">
          <button className="btn btn-outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </button>
          <button 
            onClick={() => setShowNewFolderModal(true)}
            className="btn btn-primary"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            New Folder
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center">
          <FolderOpen className="w-5 h-5 text-slate-500 mr-2" />
          Folders
        </h2>
        
        {folders.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 text-primary-600 mb-4">
              <FolderIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No folders yet</h3>
            <p className="text-slate-600 mb-6">Create your first folder to organize documents with specific processing settings.</p>
            <button 
              onClick={() => setShowNewFolderModal(true)}
              className="btn btn-primary"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Folder
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map(folder => (
              <div 
                key={folder.id}
                className="card hover:translate-y-[-2px] cursor-pointer transition-all"
                onClick={() => handleFolderClick(folder.id)}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-md bg-secondary-50">
                      <FolderIcon className="w-5 h-5 text-secondary-600" />
                    </div>
                    <div className="flex space-x-1">
                      <button 
                        className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Edit folder logic would go here
                        }}
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-1.5 rounded-full hover:bg-error-50 text-slate-500 hover:text-error-600 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Delete folder logic would go here
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{folder.name}</h3>
                  <div className="flex space-x-6 text-sm text-slate-600 mb-4">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-slate-400 mr-1.5" />
                      <span>{folder.documentCount} {folder.documentCount === 1 ? 'document' : 'documents'}</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Chunk size:</span>
                      <span className="font-medium">{folder.chunkSize} characters</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Overlap:</span>
                      <span className="font-medium">{folder.chunkOverlap} characters</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showNewFolderModal && (
        <CreateFolderModal 
          projectId={projectId!}
          onClose={() => setShowNewFolderModal(false)}
          onFolderCreated={(newFolder) => {
            setFolders(prev => [...prev, newFolder]);
            navigate(`/projects/${projectId}/folders/${newFolder.id}`);
          }}
        />
      )}
    </div>
  );
};

export default ProjectPage;