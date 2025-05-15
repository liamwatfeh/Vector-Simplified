import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectPage from './pages/ProjectPage';
import FolderPage from './pages/FolderPage';
import Layout from './components/Layout';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
      />
      <Route 
        path="/dashboard" 
        element={
          isAuthenticated ? 
            <Layout>
              <DashboardPage />
            </Layout> : 
            <Navigate to="/" replace />
        } 
      />
      <Route 
        path="/projects/:projectId" 
        element={
          isAuthenticated ? 
            <Layout>
              <ProjectPage />
            </Layout> : 
            <Navigate to="/" replace />
        } 
      />
      <Route 
        path="/projects/:projectId/folders/:folderId" 
        element={
          isAuthenticated ? 
            <Layout>
              <FolderPage />
            </Layout> : 
            <Navigate to="/" replace />
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;