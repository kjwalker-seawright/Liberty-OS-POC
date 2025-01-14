// src/components/MetricCard.jsx
export const MetricCard = ({ title, value, icon, trend, detail }) => (
    <div className="tech-card glow rounded-xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-glow/10 to-transparent rounded-bl-full"></div>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg bg-white/5">
          {icon}
        </div>
        {trend && (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            trend === 'positive' 
              ? 'bg-emerald-400/10 text-emerald-400' 
              : 'bg-red-400/10 text-red-400'
          }`}>
            {trend === 'positive' ? '↗ Optimal' : '↘ Sub-optimal'}
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <p className="mt-2 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
        {value}
      </p>
      {detail && (
        <p className="mt-2 text-sm text-gray-500">{detail}</p>
      )}
    </div>
  );