// src/components/ParameterControl.jsx
export const ParameterControl = ({ label, value, min, max, step, onChange, unit }) => (
    <div className="tech-card p-4 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-400">{label}</label>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-primary-glow">{value}</span>
          <span className="text-xs text-gray-500">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="parameter-slider w-full"
      />
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-500">{min} {unit}</span>
        <span className="text-xs text-gray-500">{max} {unit}</span>
      </div>
    </div>
  );