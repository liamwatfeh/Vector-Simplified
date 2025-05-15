import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProjects } from '../services/pineconeService';
import { Project } from '../types';
import { PlusCircle, Files, Folder, FileText, Loader2 } from 'lucide-react';
import CreateProjectModal from '../components/CreateProjectModal';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const navigate = useNavigate();
  
  // Check if project creation modal should be shown
  useEffect(() => {
    if (searchParams.get('new') === 'project') {
      setShowNewProjectModal(true);
    }
  }, [searchParams]);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      if (user?.apiKey) {
        try {
          const data = await getProjects(user.apiKey);
          setProjects(data);
        } catch (error) {
          console.error('Failed to fetch projects:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProjects();
  }, [user]);

  // Handle click on a project card
  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <button 
          onClick={() => setShowNewProjectModal(true)}
          className="btn btn-primary"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          New Project
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 text-primary-600 mb-4">
            <Files className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No projects yet</h2>
          <p className="text-slate-600 mb-6">Create your first project to get started with document management.</p>
          <button 
            onClick={() => setShowNewProjectModal(true)}
            className="btn btn-primary"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            New Project
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">Your Projects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <div 
                key={project.id}
                className="card hover:translate-y-[-2px] cursor-pointer transition-all"
                onClick={() => handleProjectClick(project.id)}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-md bg-primary-50">
                      <Files className="w-5 h-5 text-primary-600" />
                    </div>
                    <span className="text-xs text-slate-500">
                      Created {formatDate(project.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{project.name}</h3>
                  <div className="flex space-x-6 text-sm text-slate-600">
                    <div className="flex items-center">
                      <Folder className="w-4 h-4 text-slate-400 mr-1.5" />
                      <span>{project.folderCount} {project.folderCount === 1 ? 'folder' : 'folders'}</span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-slate-400 mr-1.5" />
                      <span>{project.documentCount} {project.documentCount === 1 ? 'document' : 'documents'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showNewProjectModal && (
        <CreateProjectModal 
          onClose={() => setShowNewProjectModal(false)}
          onProjectCreated={(newProject) => {
            setProjects(prev => [...prev, newProject]);
            navigate(`/projects/${newProject.id}`);
          }}
        />
      )}
    </div>
  );
};

export default DashboardPage;