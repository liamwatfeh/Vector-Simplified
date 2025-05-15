import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, UploadCloud, File, Loader2, CheckCircle } from 'lucide-react';
import { uploadDocument } from '../services/pineconeService';
import { useAuth } from '../contexts/AuthContext';
import { Document } from '../types';

interface DocumentUploaderProps {
  projectId: string;
  folderId: string;
  onClose: () => void;
  onUploadComplete: (document: Document) => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ 
  projectId, 
  folderId, 
  onClose, 
  onUploadComplete 
}) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Check if file is a PDF
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are supported.');
        return;
      }
      
      // Check file size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        setError('File size exceeds the 20MB limit.');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: uploading
  });

  const handleUpload = async () => {
    if (!user?.apiKey || !selectedFile) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + (5 + Math.random() * 10);
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);
      
      const newDocument = await uploadDocument(user.apiKey, {
        file: selectedFile,
        projectId,
        folderId
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Short delay to show 100% progress
      setTimeout(() => {
        onUploadComplete(newDocument);
      }, 500);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Failed to upload document. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-lg shadow-lg max-w-lg w-full animate-slide-up">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Upload Document</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Close"
              disabled={uploading}
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {!selectedFile ? (
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-4">
                  <UploadCloud className="w-8 h-8 text-primary-500" />
                </div>
                <p className="text-slate-700 font-medium mb-1">
                  {isDragActive ? 'Drop the file here' : 'Drag & drop a PDF file here'}
                </p>
                <p className="text-slate-500 text-sm mb-4">or click to browse</p>
                <p className="text-xs text-slate-400">PDF files only, max 20MB</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-slate-50">
                <div className="flex items-center">
                  <div className="p-2 rounded-md bg-primary-50 text-primary-600 mr-3">
                    <File className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-slate-900 truncate" title={selectedFile.name}>
                      {selectedFile.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  {!uploading && (
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="p-1 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {uploading && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>Uploading...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm">
                <h4 className="font-medium text-slate-900 mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 text-success-500 mr-1.5" />
                  What happens next?
                </h4>
                <ol className="space-y-2 text-slate-600 pl-6 list-decimal">
                  <li>Your PDF document will be uploaded</li>
                  <li>Text will be extracted from the PDF</li>
                  <li>Content will be chunked based on folder settings</li>
                  <li>Chunks will be embedded and stored in Pinecone</li>
                </ol>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!selectedFile || uploading}
              onClick={handleUpload}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Document'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploader;