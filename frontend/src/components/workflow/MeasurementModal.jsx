// src/components/workflow/MeasurementModal.jsx
import React, { useState } from 'react';
import { X, Ruler, AlertTriangle } from 'lucide-react';

const MeasurementModal = ({ isOpen, measurementType, onClose, onSubmit }) => {
  const [measurement, setMeasurement] = useState({
    value: '',
    nominal: '',
    upper_tolerance: '',
    lower_tolerance: '',
    unit: 'mm',
    notes: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!measurement.value || !measurement.nominal || 
        !measurement.upper_tolerance || !measurement.lower_tolerance) {
      setError('All measurement fields are required');
      return;
    }

    // Convert strings to numbers
    const numericMeasurement = {
      ...measurement,
      value: parseFloat(measurement.value),
      nominal: parseFloat(measurement.nominal),
      upper_tolerance: parseFloat(measurement.upper_tolerance),
      lower_tolerance: parseFloat(measurement.lower_tolerance)
    };

    onSubmit(numericMeasurement);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Ruler className="h-5 w-5 text-primary-glow" />
            <h3 className="text-lg font-semibold text-white">
              Record {measurementType} Measurement
            </h3>
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
              Measured Value
            </label>
            <input
              type="number"
              step="0.001"
              placeholder="Enter measured value"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-glow text-white"
              value={measurement.value}
              onChange={(e) => setMeasurement(prev => ({ ...prev, value: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nominal Value
            </label>
            <input
              type="number"
              step="0.001"
              placeholder="Enter nominal value"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-glow text-white"
              value={measurement.nominal}
              onChange={(e) => setMeasurement(prev => ({ ...prev, nominal: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Upper Tolerance
              </label>
              <input
                type="number"
                step="0.001"
                placeholder="+tolerance"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-glow text-white"
                value={measurement.upper_tolerance}
                onChange={(e) => setMeasurement(prev => ({ ...prev, upper_tolerance: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Lower Tolerance
              </label>
              <input
                type="number"
                step="0.001"
                placeholder="-tolerance"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-glow text-white"
                value={measurement.lower_tolerance}
                onChange={(e) => setMeasurement(prev => ({ ...prev, lower_tolerance: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Unit
            </label>
            <select
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-glow text-white"
              value={measurement.unit}
              onChange={(e) => setMeasurement(prev => ({ ...prev, unit: e.target.value }))}
            >
              <option value="mm">Millimeters (mm)</option>
              <option value="in">Inches (in)</option>
              <option value="μm">Micrometers (μm)</option>
              <option value="deg">Degrees (°)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              placeholder="Add any additional notes..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-glow text-white h-24 resize-none"
              value={measurement.notes}
              onChange={(e) => setMeasurement(prev => ({ ...prev, notes: e.target.value }))}
            />
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
              className="px-4 py-2 bg-primary-glow text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Record Measurement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeasurementModal;