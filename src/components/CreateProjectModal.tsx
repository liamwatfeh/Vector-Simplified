import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2 } from 'lucide-react';
import { createProject } from '../services/pineconeService';
import { useAuth } from '../contexts/AuthContext';
import { Project } from '../types';

interface CreateProjectModalProps {
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

interface FormData {
  name: string;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onProjectCreated }) => {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    if (!user?.apiKey) return;
    
    setIsCreating(true);
    setError(null);
    
    try {
      const newProject = await createProject(user.apiKey, {
        name: data.name
      });
      
      onProjectCreated(newProject);
    } catch (error) {
      console.error('Failed to create project:', error);
      setError('Failed to create project. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Create New Project</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Project Name
              </label>
              <input
                id="name"
                type="text"
                className={`input w-full ${errors.name ? 'border-error-300 focus-visible:ring-error-500' : ''}`}
                placeholder="Enter project name"
                {...register('name', { 
                  required: 'Project name is required',
                  minLength: {
                    value: 3,
                    message: 'Project name must be at least 3 characters'
                  }
                })}
              />
              {errors.name && (
                <p className="text-sm text-error-600 mt-1">{errors.name.message}</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Project'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;