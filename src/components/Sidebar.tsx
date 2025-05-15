import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProjects } from '../services/pineconeService';
import { Project } from '../types';
import { 
  LayoutDashboard, 
  Files, 
  FolderPlus,
  ChevronDown,
  ChevronRight,
  Loader2
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const location = useLocation();

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

  // Auto-expand project based on URL
  useEffect(() => {
    const path = location.pathname;
    const match = path.match(/\/projects\/([^/]+)/);
    
    if (match && match[1]) {
      const projectId = match[1];
      setExpandedProjects(prev => ({
        ...prev,
        [projectId]: true
      }));
    }
  }, [location.pathname]);

  const toggleProjectExpand = (projectId: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:block">
      <div className="h-full py-4">
        <nav className="space-y-1 px-3">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              `flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </NavLink>
          
          <div className="pt-4 pb-2">
            <div className="flex items-center justify-between px-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Projects
              </h2>
              <NavLink
                to="/dashboard?new=project"
                className="p-1 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
                title="Create new project"
              >
                <FolderPlus className="w-4 h-4" />
              </NavLink>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-1">
              {projects.map(project => (
                <div key={project.id} className="space-y-1">
                  <div 
                    className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-100 cursor-pointer transition-colors"
                    onClick={() => toggleProjectExpand(project.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Files className="w-5 h-5 text-slate-500" />
                      <span>{project.name}</span>
                    </div>
                    {expandedProjects[project.id] ? (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                  
                  {expandedProjects[project.id] && (
                    <div className="pl-9 space-y-1">
                      <NavLink
                        to={`/projects/${project.id}`}
                        className={({ isActive }) => 
                          `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            isActive 
                              ? 'bg-primary-50 text-primary-700' 
                              : 'text-slate-600 hover:bg-slate-100'
                          }`
                        }
                      >
                        All folders
                      </NavLink>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;