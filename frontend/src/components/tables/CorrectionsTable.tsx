import React from 'react';
import { NewsCorrection } from '../../types';
import { formatDateTime } from '../../lib/formatters';

export const CorrectionsTable: React.FC<{ corrections: NewsCorrection[] }> = ({ corrections }) => {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Article Headline</th>
            <th>Original Tag / Conf</th>
            <th>Corrected Tag</th>
            <th>Analyst</th>
            <th>Reason</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {corrections.map((corr) => (
            <tr key={corr.id}>
              <td style={{ maxWidth: '350px', fontWeight: 500 }}>{corr.article?.headline || `Article #${corr.article_id}`}</td>
              <td>
                {corr.old_company_id ? (
                  <span className="badge badge-gray">Old ID #{corr.old_company_id} ({((corr.old_confidence || 0) * 100).toFixed(0)}%)</span>
                ) : (
                  <span className="badge badge-gray">Uncategorized</span>
                )}
              </td>
              <td><span className="badge badge-green">New ID #{corr.new_company_id} (100% Manual)</span></td>
              <td style={{ fontWeight: 500 }}>{corr.corrected_by}</td>
              <td style={{ color: 'var(--text-secondary)' }}>{corr.correction_reason || '—'}</td>
              <td>{formatDateTime(corr.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
