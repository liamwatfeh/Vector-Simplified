import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getFolder, getDocuments, deleteDocument } from '../services/pineconeService';
import { Folder, Document } from '../types';
import { 
  Upload, 
  FileText, 
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
  RefreshCw,
  MoreVertical,
  ChevronLeft,
  Info,
  X,
  Plus,
  Settings,
  AlertTriangle
} from 'lucide-react';
import DocumentUploader from '../components/DocumentUploader';

const FolderPage: React.FC = () => {
  const { projectId, folderId } = useParams<{ projectId: string, folderId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [folder, setFolder] = useState<Folder | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState<Record<string, boolean>>({});

  // Fetch folder and document data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.apiKey || !projectId || !folderId) return;
      
      setLoading(true);
      
      try {
        const [folderData, documentsData] = await Promise.all([
          getFolder(user.apiKey, projectId, folderId),
          getDocuments(user.apiKey, projectId, folderId)
        ]);
        
        setFolder(folderData);
        setDocuments(documentsData);
      } catch (error) {
        console.error('Failed to fetch folder data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, projectId, folderId]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Handle document upload completion
  const handleUploadComplete = (newDocument: Document) => {
    setDocuments(prev => [newDocument, ...prev]);
    setShowUploader(false);
  };

  // Handle document deletion
  const handleDeleteDocument = async (documentId: string) => {
    if (!user?.apiKey || !projectId || !folderId) return;
    
    if (confirm('Are you sure you want to delete this document? This will also remove all associated vectors.')) {
      setDeleteInProgress(prev => ({ ...prev, [documentId]: true }));
      
      try {
        await deleteDocument(user.apiKey, projectId, folderId, documentId);
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      } catch (error) {
        console.error('Failed to delete document:', error);
        alert('Failed to delete document. Please try again.');
      } finally {
        setDeleteInProgress(prev => ({ ...prev, [documentId]: false }));
      }
    }
  };

  // Get status indicator
  const getStatusIndicator = (status: string) => {
    if (status === 'processing') {
      return (
        <span className="flex items-center text-slate-600">
          <Clock className="w-4 h-4 text-warning-500 mr-1.5" />
          Processing
        </span>
      );
    } else if (status === 'completed') {
      return (
        <span className="flex items-center text-slate-600">
          <CheckCircle className="w-4 h-4 text-success-500 mr-1.5" />
          Completed
        </span>
      );
    } else {
      return (
        <span className="flex items-center text-slate-600">
          <AlertCircle className="w-4 h-4 text-error-500 mr-1.5" />
          Error
        </span>
      );
    }
  };

  // Folder Settings Component
  const FolderSettings = () => {
    const [newChunkSize, setNewChunkSize] = useState(folder?.chunkSize || 1000);
    const [newChunkOverlap, setNewChunkOverlap] = useState(folder?.chunkOverlap || 200);
    const [metadataConfig, setMetadataConfig] = useState(folder?.metadataConfig || {});
    const [saving, setSaving] = useState(false);
    
    const handleSave = async () => {
      if (!user?.apiKey || !folder) return;
      setSaving(true);
      
      try {
        // Update folder settings logic would go here
        // For now, just close the modal
        setShowSettings(false);
      } catch (error) {
        console.error('Failed to update folder settings:', error);
      } finally {
        setSaving(false);
      }
    };
    
    return (
      <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Folder Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-error-50 border border-error-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-error-500 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-error-900">Warning: Changing Settings</h3>
                    <p className="mt-1 text-sm text-error-700">
                      Modifying these settings will only affect future document uploads. 
                      Existing documents will not be reprocessed.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900">Processing Settings</h3>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Chunk Size (characters)
                  </label>
                  <input
                    type="number"
                    value={newChunkSize}
                    onChange={(e) => setNewChunkSize(parseInt(e.target.value))}
                    min={100}
                    max={5000}
                    className="input w-full"
                  />
                  <p className="text-xs text-slate-500">
                    Determines how text is split for processing. Smaller chunks are more specific, larger chunks provide more context.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Chunk Overlap (characters)
                  </label>
                  <input
                    type="number"
                    value={newChunkOverlap}
                    onChange={(e) => setNewChunkOverlap(parseInt(e.target.value))}
                    min={0}
                    max={newChunkSize / 2}
                    className="input w-full"
                  />
                  <p className="text-xs text-slate-500">
                    The number of characters that overlap between chunks to maintain context across chunk boundaries.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900">Metadata Configuration</h3>
                
                {Object.entries(metadataConfig).map(([key, config]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-slate-700">
                        {key}
                      </label>
                      <button
                        className="text-error-600 hover:text-error-700 text-sm font-medium"
                        onClick={() => {
                          const newConfig = { ...metadataConfig };
                          delete newConfig[key];
                          setMetadataConfig(newConfig);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                    
                    {config.type === 'select' && (
                      <div className="space-y-2">
                        {config.options?.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newConfig = { ...metadataConfig };
                                newConfig[key].options![index] = e.target.value;
                                setMetadataConfig(newConfig);
                              }}
                              className="input flex-1"
                            />
                            <button
                              className="p-1.5 rounded-full hover:bg-error-50 text-slate-500 hover:text-error-600"
                              onClick={() => {
                                const newConfig = { ...metadataConfig };
                                newConfig[key].options = config.options?.filter((_, i) => i !== index);
                                setMetadataConfig(newConfig);
                              }}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                          onClick={() => {
                            const newConfig = { ...metadataConfig };
                            newConfig[key].options = [...(config.options || []), ''];
                            setMetadataConfig(newConfig);
                          }}
                        >
                          Add Option
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                
                <button
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
                  onClick={() => {
                    const key = prompt('Enter field name:');
                    if (key && !metadataConfig[key]) {
                      setMetadataConfig({
                        ...metadataConfig,
                        [key]: {
                          type: 'select',
                          options: [],
                          required: true
                        }
                      });
                    }
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Metadata Field
                </button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Folder not found</h2>
        <p className="text-slate-600 mb-6">The folder you're looking for doesn't exist or you don't have access to it.</p>
        <button 
          onClick={() => navigate(`/projects/${projectId}`)}
          className="btn btn-primary"
        >
          Back to Project
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center mb-1">
            <button 
              onClick={() => navigate(`/projects/${projectId}`)}
              className="mr-2 p-1 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-slate-900">{folder.name}</h1>
          </div>
          <p className="text-sm text-slate-500 flex items-center">
            <FileText className="w-4 h-4 mr-1.5" />
            {folder.documentCount} {folder.documentCount === 1 ? 'document' : 'documents'}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowSettings(true)}
            className="btn btn-outline"
          >
            <Settings className="w-4 h-4 mr-2" />
            Folder Settings
          </button>
          <button
            onClick={() => setShowUploader(true)}
            className="btn btn-primary"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 mb-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
            <Info className="w-4 h-4 text-slate-500 mr-1.5" />
            Processing Settings
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <div className="text-xs text-slate-500 mb-1">Chunk Size</div>
              <div className="font-medium">{folder.chunkSize} characters</div>
            </div>
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <div className="text-xs text-slate-500 mb-1">Chunk Overlap</div>
              <div className="font-medium">{folder.chunkOverlap} characters</div>
            </div>
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <div className="text-xs text-slate-500 mb-1">Metadata Parameters</div>
              <div className="font-medium">
                {folder.metadataParams.length > 0 
                  ? folder.metadataParams.join(', ') 
                  : 'None'}
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-slate-900 mb-4">Documents</h2>
        
        {documents.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 text-primary-600 mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No documents yet</h3>
            <p className="text-slate-600 mb-6">Upload your first document to start processing.</p>
            <button 
              onClick={() => setShowUploader(true)}
              className="btn btn-primary"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Uploaded</th>
                    <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Size</th>
                    <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Vectors</th>
                    <th className="text-right p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {documents.map(document => (
                    <tr key={document.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-slate-400 mr-3" />
                          <span className="font-medium text-slate-900">{document.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusIndicator(document.status)}
                      </td>
                      <td className="p-4 text-slate-600">
                        {formatDate(document.createdAt)}
                      </td>
                      <td className="p-4 text-slate-600">
                        {formatFileSize(document.fileSize)}
                      </td>
                      <td className="p-4 text-slate-600">
                        {document.vectorCount ?? '-'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {document.status === 'processing' && (
                            <button 
                              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                              disabled
                              title="Processing in progress"
                            >
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            </button>
                          )}
                          <button 
                            className="p-1.5 rounded-full hover:bg-error-50 text-slate-500 hover:text-error-600 transition-colors"
                            onClick={() => handleDeleteDocument(document.id)}
                            disabled={deleteInProgress[document.id]}
                            title="Delete document"
                          >
                            {deleteInProgress[document.id] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                          <button 
                            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                            title="More options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showUploader && (
        <DocumentUploader 
          projectId={projectId!}
          folderId={folderId!}
          onClose={() => setShowUploader(false)}
          onUploadComplete={handleUploadComplete}
        />
      )}

      {showSettings && <FolderSettings />}
    </div>
  );
};

export default FolderPage;