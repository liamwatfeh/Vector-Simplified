import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { createFolder } from '../services/pineconeService';
import { useAuth } from '../contexts/AuthContext';
import { Folder } from '../types';

interface CreateFolderModalProps {
  projectId: string;
  onClose: () => void;
  onFolderCreated: (folder: Folder) => void;
}

interface MetadataField {
  key: string;
  type: 'text' | 'number' | 'date' | 'select';
  options: string[];
  required: boolean;
}

interface FormData {
  name: string;
  chunkSize: number;
  chunkOverlap: number;
  metadataFields: MetadataField[];
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({ 
  projectId, 
  onClose, 
  onFolderCreated 
}) => {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadataFields, setMetadataFields] = useState<MetadataField[]>([]);
  const [expandedFields, setExpandedFields] = useState<Record<number, boolean>>({});
  
  const { 
    register, 
    handleSubmit, 
    watch,
    setValue,
    formState: { errors } 
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      chunkSize: 1000,
      chunkOverlap: 200,
      metadataFields: []
    }
  });

  const chunkSize = watch('chunkSize');
  const chunkOverlap = watch('chunkOverlap');

  const adjustChunkSize = (amount: number) => {
    const newValue = Math.max(100, Math.min(5000, chunkSize + amount));
    setValue('chunkSize', newValue);
  };

  const adjustChunkOverlap = (amount: number) => {
    const newValue = Math.max(0, Math.min(chunkSize / 2, chunkOverlap + amount));
    setValue('chunkOverlap', newValue);
  };

  const addMetadataField = () => {
    setMetadataFields([...metadataFields, { 
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
    setMetadataFields(metadataFields.filter((_, i) => i !== index));
    setExpandedFields(prev => {
      const newExpanded = { ...prev };
      delete newExpanded[index];
      return newExpanded;
    });
  };

  const updateMetadataField = (index: number, field: Partial<MetadataField>) => {
    const newFields = [...metadataFields];
    newFields[index] = { ...newFields[index], ...field };
    setMetadataFields(newFields);
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

  const onSubmit = async (data: FormData) => {
    if (!user?.apiKey) return;
    
    // Validate that all select fields have at least one option
    const invalidField = metadataFields.find(field => 
      field.type === 'select' && field.options.length === 0
    );

    if (invalidField) {
      setError(`Field "${invalidField.key}" must have at least one option.`);
      return;
    }
    
    setIsCreating(true);
    setError(null);
    
    try {
      const metadataConfig = metadataFields.reduce((acc, field) => ({
        ...acc,
        [field.key]: {
          type: field.type,
          options: field.type === 'select' ? field.options : undefined,
          required: field.required
        }
      }), {});

      const newFolder = await createFolder(user.apiKey, {
        name: data.name,
        projectId,
        chunkSize: data.chunkSize,
        chunkOverlap: data.chunkOverlap,
        metadataParams: metadataFields.map(field => field.key),
        metadataConfig
      });
      
      onFolderCreated(newFolder);
    } catch (error) {
      console.error('Failed to create folder:', error);
      setError('Failed to create folder. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Create New Folder</h2>
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
                Folder Name
              </label>
              <input
                id="name"
                type="text"
                className={`input w-full ${errors.name ? 'border-error-300 focus-visible:ring-error-500' : ''}`}
                placeholder="Enter folder name"
                {...register('name', { 
                  required: 'Folder name is required',
                  minLength: {
                    value: 3,
                    message: 'Folder name must be at least 3 characters'
                  }
                })}
              />
              {errors.name && (
                <p className="text-sm text-error-600 mt-1">{errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Processing Settings</h3>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Chunk Size (characters)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="100"
                    value={chunkSize}
                    onChange={(e) => setValue('chunkSize', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <input
                    type="number"
                    className="w-24 input text-center"
                    value={chunkSize}
                    onChange={(e) => setValue('chunkSize', parseInt(e.target.value))}
                    min="100"
                    max="5000"
                    step="100"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Determines how text is split for processing. Smaller chunks are more specific, larger chunks provide more context.
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Chunk Overlap (characters)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max={Math.floor(chunkSize / 2)}
                    step="25"
                    value={chunkOverlap}
                    onChange={(e) => setValue('chunkOverlap', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <input
                    type="number"
                    className="w-24 input text-center"
                    value={chunkOverlap}
                    onChange={(e) => setValue('chunkOverlap', parseInt(e.target.value))}
                    min="0"
                    max={Math.floor(chunkSize / 2)}
                    step="25"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  The number of characters that overlap between chunks to maintain context across chunk boundaries.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">
                    Metadata Fields
                  </label>
                  <button
                    type="button"
                    onClick={addMetadataField}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
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
                              placeholder="Field name"
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
                              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
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
                  'Create Folder'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateFolderModal;