import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface LoginFormData {
  apiKey: string;
}

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoggingIn(true);
    setError(null);
    
    try {
      const success = await login(data.apiKey);
      
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid API key. Please check and try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <svg width="72" height="72" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4">
            <path d="M16 2L4 9V23L16 30L28 23V9L16 2Z" fill="#13B8A9" stroke="#11A394" strokeWidth="2"/>
            <path d="M16 9L10 12.5V19.5L16 23L22 19.5V12.5L16 9Z" fill="white" stroke="#11A394" strokeWidth="1.5"/>
          </svg>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to Pinecone RAG Manager</h1>
          <p className="text-slate-600">Manage your document vectors with ease</p>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Sign in with your Pinecone API Key</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-error-50 text-error-700 rounded-md flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-error-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="apiKey" className="block text-sm font-medium text-slate-700">
                Pinecone API Key
              </label>
              <input
                id="apiKey"
                type="password"
                className={`input w-full ${errors.apiKey ? 'border-error-300 focus-visible:ring-error-500' : ''}`}
                placeholder="Enter your Pinecone API key"
                {...register('apiKey', { 
                  required: 'API key is required',
                  minLength: {
                    value: 10,
                    message: 'API key should be at least 10 characters'
                  }
                })}
              />
              {errors.apiKey && (
                <p className="text-sm text-error-600 mt-1">{errors.apiKey.message}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="btn btn-primary w-full flex items-center justify-center py-2.5"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect to Pinecone'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Don't have a Pinecone account? <a href="https://app.pinecone.io/signup" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 font-medium">Sign up here</a>
            </p>
          </div>
        </div>
        
        <p className="text-center mt-8 text-sm text-slate-500">
          Need help finding your API key? Check the <a href="https://docs.pinecone.io/docs/authentication" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">documentation</a>.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;