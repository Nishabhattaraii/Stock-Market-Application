import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No data available',
  description = 'There are currently no records to display.',
}) => {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
      <Inbox size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
      <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{title}</h4>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{description}</p>
    </div>
  );
};
