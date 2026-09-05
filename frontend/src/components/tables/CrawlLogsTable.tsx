import React from 'react';
import { CrawlRun } from '../../types';
import { formatDateTime } from '../../lib/formatters';

export const CrawlLogsTable: React.FC<{ crawls: CrawlRun[] }> = ({ crawls }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <span className="badge badge-green">Completed</span>;
      case 'completed_with_errors': return <span className="badge badge-amber">With Errors</span>;
      case 'failed': return <span className="badge badge-red">Failed</span>;
      case 'running': return <span className="badge badge-blue">Running</span>;
      default: return <span className="badge badge-gray">{status}</span>;
    }
  };

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Run ID</th>
            <th>Portal</th>
            <th>Triggered By</th>
            <th>Started At</th>
            <th>Completed At</th>
            <th>Found / Inserted</th>
            <th>Errors</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {crawls.map((c) => (
            <tr key={c.id}>
              <td style={{ fontWeight: 600 }}>#{c.id}</td>
              <td style={{ fontWeight: 500 }}>{c.portal}</td>
              <td>{c.triggered_by}</td>
              <td>{formatDateTime(c.started_at)}</td>
              <td>{c.completed_at ? formatDateTime(c.completed_at) : '—'}</td>
              <td>{c.items_found} found / {c.items_inserted} added</td>
              <td style={{ color: c.errors_count > 0 ? '#dc2626' : 'var(--text-muted)' }}>{c.errors_count}</td>
              <td>{getStatusBadge(c.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
