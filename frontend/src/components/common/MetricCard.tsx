import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, subtext, icon: Icon, trend }) => {
  const getTrendColor = () => {
    if (trend === 'up') return '#16a34a';
    if (trend === 'down') return '#dc2626';
    return 'var(--text-muted)';
  };

  return (
    <div className="kpi-card">
      <div className="flex justify-between items-center" style={{ marginBottom: '6px' }}>
        <span className="kpi-label">{label}</span>
        {Icon && <Icon size={18} style={{ color: 'var(--text-muted)' }} />}
      </div>
      <div className="kpi-value">{value}</div>
      {subtext && (
        <div className="kpi-subtext" style={{ color: getTrendColor() }}>
          {subtext}
        </div>
      )}
    </div>
  );
};
