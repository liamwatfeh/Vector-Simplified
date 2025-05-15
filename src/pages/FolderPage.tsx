// Previous imports remain the same...

const FolderPage: React.FC = () => {
  // Previous state and hooks remain the same...
  const [showSettings, setShowSettings] = useState(false);
  
  // Add this component within FolderPage
  const FolderSettings = () => {
    const [newChunkSize, setNewChunkSize] = useState(folder?.chunkSize || 1000);
    const [newChunkOverlap, setNewChunkOverlap] = useState(folder?.chunkOverlap || 200);
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
                
                {folder?.metadataConfig && Object.entries(folder.metadataConfig).map(([key, config]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-slate-700">
                        {key}
                      </label>
                      <button
                        className="text-error-600 hover:text-error-700 text-sm font-medium"
                        onClick={() => {
                          // Remove field logic would go here
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
                                // Update option logic would go here
                              }}
                              className="input flex-1"
                            />
                            <button
                              className="p-1.5 rounded-full hover:bg-error-50 text-slate-500 hover:text-error-600"
                              onClick={() => {
                                // Remove option logic would go here
                              }}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                          onClick={() => {
                            // Add option logic would go here
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
                    // Add field logic would go here
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
  
  // Add settings button to the header
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
            <h1 className="text-2xl font-bold text-slate-900">{folder?.name}</h1>
          </div>
          <p className="text-sm text-slate-500 flex items-center">
            <FileText className="w-4 h-4 mr-1.5" />
            {folder?.documentCount} {folder?.documentCount === 1 ? 'document' : 'documents'}
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