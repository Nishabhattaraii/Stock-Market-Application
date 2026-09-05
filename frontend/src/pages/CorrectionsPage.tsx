import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckSquare, Download } from 'lucide-react';
import { api, downloadExport } from '../lib/api';
import { CorrectionsTable } from '../components/tables/CorrectionsTable';
import { SkeletonLoader } from '../components/common/SkeletonLoader';

export const CorrectionsPage: React.FC = () => {
  const { data: corrections, isLoading } = useQuery({
    queryKey: ['corrections-audit-log'],
    queryFn: () => api.getCorrections(),
  });

  const handleExportTrainingDataset = async (format: 'pdf' | 'csv') => {
    try {
      await downloadExport(`/exports/news?format=${format}`, `news_retraining_dataset.${format}`);
    } catch (err: any) {
      alert(err.message || 'Export download failed');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Analyst Tag Corrections & Training Audit Log</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Audit history of manual company tag overrides and retraining dataset export</p>
        </div>

        <div className="flex gap-2">
          <button onClick={() => handleExportTrainingDataset('csv')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12.5px' }}>
            <Download size={14} />
            <span>Export CSV Dataset</span>
          </button>
          <button onClick={() => handleExportTrainingDataset('pdf')} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12.5px' }}>
            <Download size={14} />
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <CheckSquare size={18} />
            <h3 className="card-title">Correction History Log ({corrections?.length || 0})</h3>
          </div>
        </div>
        {isLoading ? <SkeletonLoader rows={5} /> : <CorrectionsTable corrections={corrections || []} />}
      </div>
    </div>
  );
};
