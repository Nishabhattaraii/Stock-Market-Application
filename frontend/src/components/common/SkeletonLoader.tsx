import React from 'react';

export const SkeletonLoader: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            height: '20px',
            backgroundColor: '#e2e8f0',
            borderRadius: '4px',
            animation: 'pulse 1.5s infinite ease-in-out',
            width: `${100 - (i % 3) * 15}%`
          }}
        />
      ))}
    </div>
  );
};
