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
  Settings,
  X,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from 'lucide-react';
import DocumentUploader from '../components/DocumentUploader';

interface MetadataField {
  key: string;
  type: 'text' | 'number' | 'date' | 'select';
  options: string[];
  required: boolean;
}

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

  const FolderSettings = () => {
    const [chunkSize, setChunkSize] = useState(folder?.chunkSize || 1000);
    const [chunkOverlap, setChunkOverlap] = useState(folder?.chunkOverlap || 200);
    const [metadataFields, setMetadataFields] = useState<MetadataField[]>([]);
    const [expandedFields, setExpandedFields] = useState<Record<number, boolean>>({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      if (folder?.metadataConfig) {
        const fields = Object.entries(folder.metadataConfig).map(([key, config]) => ({
          key,
          type: config.type,
          options: config.options || [],
          required: config.required
        }));
        setMetadataFields(fields);
        
        // Set all fields as expanded initially
        const expanded: Record<number, boolean> = {};
        fields.forEach((_, index) => {
          expanded[index] = true;
        });
        setExpandedFields(expanded);
      }
    }, [folder]);

    const adjustChunkSize = (amount: number) => {
      setChunkSize(prev => Math.max(100, Math.min(5000, prev + amount)));
    };

    const adjustChunkOverlap = (amount: number) => {
      setChunkOverlap(prev => Math.max(0, Math.min(chunkSize / 2, prev + amount)));
    };

    const addMetadataField = () => {
      setMetadataFields(prev => [...prev, { 
        key: '', 
        type: 'select', 
        options: [],
        required: true 
      }]);
      setExpandedFields(prev => ({
        ...prev,
        [metadataFields.length]: true
      }));
    };

    const removeMetadataField = (index: number) => {
      setMetadataFields(fields => fields.filter((_, i) => i !== index));
      setExpandedFields(prev => {
        const newExpanded = { ...prev };
        delete newExpanded[index];
        return newExpanded;
      });
    };

    const updateMetadataField = (index: number, field: Partial<MetadataField>) => {
      setMetadataFields(fields => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], ...field };
        return newFields;
      });
    };

    const addOption = (fieldIndex: number) => {
      const field = metadataFields[fieldIndex];
      updateMetadataField(fieldIndex, {
        options: [...field.options, '']
      });
    };

    const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
      const field = metadataFields[fieldIndex];
      const newOptions = [...field.options];
      newOptions[optionIndex] = value;
      updateMetadataField(fieldIndex, { options: newOptions });
    };

    const removeOption = (fieldIndex: number, optionIndex: number) => {
      const field = metadataFields[fieldIndex];
      const newOptions = field.options.filter((_, i) => i !== optionIndex);
      updateMetadataField(fieldIndex, { options: newOptions });
    };

    const toggleFieldExpanded = (index: number) => {
      setExpandedFields(prev => ({
        ...prev,
        [index]: !prev[index]
      }));
    };

    const handleSave = async () => {
      if (!user?.apiKey || !folder) return;
      
      // Validate that all select fields have at least one option
      const invalidField = metadataFields.find(field => 
        field.type === 'select' && field.options.length === 0
      );

      if (invalidField) {
        setError(`Field "${invalidField.key}" must have at least one option.`);
        return;
      }
      
      setSaving(true);
      setError(null);
      
      try {
        // Update folder settings logic would go here
        setShowSettings(false);
      } catch (error) {
        console.error('Failed to update folder settings:', error);
        setError('Failed to update settings. Please try again.');
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
              <div className="bg-error-50 border border-error-200 rounded-lg p-4">
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
                  <div className="flex items-center">
                    <button 
                      type="button"
                      className="bg-slate-100 p-1.5 rounded-l-md border border-slate-300 text-slate-600 hover:bg-slate-200 transition-colors"
                      onClick={() => adjustChunkSize(-100)}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={chunkSize}
                      onChange={(e) => setChunkSize(parseInt(e.target.value))}
                      className="input rounded-none text-center border-x-0"
                      min={100}
                      max={5000}
                    />
                    <button 
                      type="button"
                      className="bg-slate-100 p-1.5 rounded-r-md border border-slate-300 text-slate-600 hover:bg-slate-200 transition-colors"
                      onClick={() => adjustChunkSize(100)}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Determines how text is split for processing. Smaller chunks are more specific, larger chunks provide more context.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Chunk Overlap (characters)
                  </label>
                  <div className="flex items-center">
                    <button 
                      type="button"
                      className="bg-slate-100 p-1.5 rounded-l-md border border-slate-300 text-slate-600 hover:bg-slate-200 transition-colors"
                      onClick={() => adjustChunkOverlap(-25)}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={chunkOverlap}
                      onChange={(e) => setChunkOverlap(parseInt(e.target.value))}
                      className="input rounded-none text-center border-x-0"
                      min={0}
                      max={chunkSize / 2}
                    />
                    <button 
                      type="button"
                      className="bg-slate-100 p-1.5 rounded-r-md border border-slate-300 text-slate-600 hover:bg-slate-200 transition-colors"
                      onClick={() => adjustChunkOverlap(25)}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    The number of characters that overlap between chunks to maintain context across chunk boundaries.
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Metadata Fields</h3>
                  <button
                    type="button"
                    onClick={addMetadataField}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Field
                  </button>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-2">
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-slate-500 mt-0.5" />
                    <div className="space-y-2 text-sm text-slate-600">
                      <p>
                        Metadata fields help you organize and filter your documents. Define fields and their allowed values to ensure consistency when uploading documents.
                      </p>
                      <p>
                        For example, create a "Category" field with options like "Sales", "Marketing", and "Product" to categorize your documents.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {metadataFields.map((field, fieldIndex) => (
                    <div 
                      key={fieldIndex} 
                      className="bg-white border border-slate-200 rounded-lg overflow-hidden"
                    >
                      <div className="p-3 bg-slate-50 border-b border-slate-200">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={field.key}
                              onChange={(e) => updateMetadataField(fieldIndex, { key: e.target.value })}
                              placeholder="Field name (e.g., category)"
                              className="input w-full text-sm"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <label className="flex items-center space-x-1.5">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => updateMetadataField(fieldIndex, { required: e.target.checked })}
                                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                              />
                              <span className="text-sm text-slate-600">Required</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => toggleFieldExpanded(fieldIndex)}
                              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
                            >
                              {expandedFields[fieldIndex] ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                            {metadataFields.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeMetadataField(fieldIndex)}
                                className="p-1.5 rounded-md hover:bg-error-50 text-slate-500 hover:text-error-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {expandedFields[fieldIndex] && (
                        <div className="p-3 space-y-3">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Options</label>
                            {field.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateOption(fieldIndex, optionIndex, e.target.value)}
                                  placeholder="Enter an option"
                                  className="input flex-1 text-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeOption(fieldIndex, optionIndex)}
                                  className="p-1.5 rounded-md hover:bg-error-50 text-slate-500 hover:text-error-600"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addOption(fieldIndex)}
                              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Option
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="btn btn-outline"
                disabled={saving}
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