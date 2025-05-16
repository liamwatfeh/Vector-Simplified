import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFolders } from '../contexts/FoldersContext';
import { getProjects } from '../services/pineconeService';
import { Project } from '../types';
import { 
  LayoutDashboard, 
  Files, 
  FolderPlus,
  ChevronDown,
  ChevronRight,
  Loader2,
  Settings,
  HelpCircle,
  Code,
  X,
  Folder as FolderIcon
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { folders, refreshFolders } = useFolders();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const [showImplementation, setShowImplementation] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchProjects = async () => {
      if (user?.apiKey) {
        try {
          const data = await getProjects(user.apiKey);
          setProjects(data);
          
          // Fetch folders for each project
          await Promise.all(
            data.map(async (project) => {
              await refreshFolders(project.id);
            })
          );
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
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex md:flex-col">
      <div className="flex-1 overflow-y-auto py-4">
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
                  
                  {expandedProjects[project.id] && folders[project.id] && (
                    <div className="pl-9 space-y-1">
                      {folders[project.id].map(folder => (
                        <NavLink
                          key={folder.id}
                          to={`/projects/${project.id}/folders/${folder.id}`}
                          className={({ isActive }) => 
                            `flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                              isActive 
                                ? 'bg-primary-50 text-primary-700 font-medium' 
                                : 'text-slate-600 hover:bg-slate-100'
                            }`
                          }
                        >
                          <FolderIcon className="w-4 h-4" />
                          <span>{folder.name}</span>
                        </NavLink>
                      ))}
                      <NavLink
                        to={`/projects/${project.id}?new=folder`}
                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <FolderPlus className="w-4 h-4" />
                        <span>New Folder</span>
                      </NavLink>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </nav>
      </div>
      
      <div className="border-t border-slate-200 p-4">
        <NavLink
          to="/settings"
          className={({ isActive }) => 
            `flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive 
                ? 'bg-primary-50 text-primary-700' 
                : 'text-slate-600 hover:bg-slate-100'
            }`
          }
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </NavLink>
        
        <button
          onClick={() => setShowImplementation(true)}
          className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-sm text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Code className="w-4 h-4" />
          <span>Implementation Guide</span>
        </button>
      </div>

      {showImplementation && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-900">Claude Desktop Implementation</h2>
                <button
                  onClick={() => setShowImplementation(false)}
                  className="p-1 rounded-full hover:bg-slate-100"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <div className="prose prose-slate">
                <p className="text-slate-600 mb-4">
                  Add the following configuration to your Claude Desktop settings:
                </p>
                
                <div className="bg-slate-900 rounded-lg p-4 mb-4">
                  <pre className="text-slate-50 overflow-x-auto">
                    <code>{JSON.stringify({
                      mcpServers: {
                        pinecone: {
                          command: "npx",
                          args: ["-y", "@pinecone-database/mcp"],
                          env: {
                            PINECONE_API_KEY: user?.apiKey || "YOUR_API_KEY"
                          }
                        }
                      }
                    }, null, 2)}</code>
                  </pre>
                  
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify({
                        mcpServers: {
                          pinecone: {
                            command: "npx",
                            args: ["-y", "@pinecone-database/mcp"],
                            env: {
                              PINECONE_API_KEY: user?.apiKey || "YOUR_API_KEY"
                            }
                          }
                        }
                      }, null, 2));
                    }}
                    className="mt-2 px-3 py-1 text-xs bg-slate-700 text-slate-200 rounded hover:bg-slate-600"
                  >
                    Copy to Clipboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;