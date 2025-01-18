// src/components/workflow/ApprovalDialog.jsx
import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

const ApprovalDialog = ({ isOpen, onClose, onSubmit }) => {
  const [approvalData, setApprovalData] = useState({
    approver: '',
    notes: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!approvalData.approver.trim()) {
      setError('Approver name is required');
      return;
    }

    onSubmit(approvalData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold text-white">Stage Approval</h3>
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
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Approver Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-glow text-white"
              value={approvalData.approver}
              onChange={(e) => setApprovalData(prev => ({ 
                ...prev, 
                approver: e.target.value 
              }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Approval Notes
            </label>
            <textarea
              placeholder="Add any approval notes or comments..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-glow text-white h-24 resize-none"
              value={approvalData.notes}
              onChange={(e) => setApprovalData(prev => ({ 
                ...prev, 
                notes: e.target.value 
              }))}
            />
          </div>

          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-400">
              By approving this stage, you confirm that:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-green-400/80">
              <li>• All quality gates have been successfully completed</li>
              <li>• Required documentation has been reviewed and verified</li>
              <li>• The stage meets all specified requirements</li>
              <li>• You are authorized to approve this stage</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Approve Stage</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApprovalDialog;