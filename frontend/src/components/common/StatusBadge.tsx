import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'default' | 'success' | 'danger' | 'warning' | 'info';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'default' }) => {
  const getBadgeStyle = () => {
    switch (type) {
      case 'success': return 'badge-green';
      case 'danger': return 'badge-red';
      case 'warning': return 'badge-amber';
      case 'info': return 'badge-blue';
      default: return 'badge-gray';
    }
  };

  return <span className={`badge ${getBadgeStyle()}`}>{status}</span>;
};
