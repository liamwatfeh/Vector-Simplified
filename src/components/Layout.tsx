import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import { 
  LogOut, 
  ChevronLeft,
  Settings,
  HelpCircle
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isRootPage = location.pathname === '/dashboard';
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!isRootPage && (
                <button 
                  onClick={handleBack}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                  aria-label="Go back"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
              )}
              <div className="flex items-center space-x-2">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                  <path d="M16 2L4 9V23L16 30L28 23V9L16 2Z" fill="#13B8A9" stroke="#11A394" strokeWidth="2"/>
                  <path d="M16 9L10 12.5V19.5L16 23L22 19.5V12.5L16 9Z" fill="white" stroke="#11A394" strokeWidth="1.5"/>
                </svg>
                <h1 className="text-xl font-semibold text-slate-900 m-0">Pinecone RAG Manager</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                className="p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Help"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <button 
                className="p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={handleLogout} 
                className="p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;