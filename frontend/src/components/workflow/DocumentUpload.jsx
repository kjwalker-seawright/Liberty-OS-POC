// src/components/workflow/DocumentUpload.jsx
import React, { useState, useRef } from 'react';
import { X, Upload, File, AlertTriangle, Loader } from 'lucide-react';

const DocumentUpload = ({ isOpen, onClose, onSubmit }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    try {
      // Simulate file upload - in production, you would upload to your server/storage
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onSubmit({
        url: URL.createObjectURL(file),
        type: file.type,
        name: file.name,
        size: file.size
      });
    } catch (err) {
      setError('Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <File className="h-5 w-5 text-primary-glow" />
            <h3 className="text-lg font-semibold text-white">Upload Documentation</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div 
            className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-primary-glow transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
            />
            
            <Upload className="h-8 w-8 mx-auto text-gray-400" />
            
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-300">
                {file ? file.name : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-500">
                PDF, Word, Excel or images up to 10MB
              </p>
            </div>
          </div>

          {file && (
            <div className="flex items-center space-x-2 text-sm">
              <File className="h-4 w-4 text-primary-glow" />
              <span className="text-gray-300">{file.name}</span>
              <span className="text-gray-500">
                ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-glow text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
              disabled={loading || !file}
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Upload Document</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentUpload;