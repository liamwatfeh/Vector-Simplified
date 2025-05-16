import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { FoldersProvider } from './contexts/FoldersContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FoldersProvider>
          <App />
        </FoldersProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);