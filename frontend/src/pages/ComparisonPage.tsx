import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeftRight, Check } from 'lucide-react';
import { api } from '../lib/api';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { formatCurrency, formatNumber, formatPercent } from '../lib/formatters';
import { CompanyComparisonItem } from '../types';

export const ComparisonPage: React.FC = () => {
  const { data: companies, isLoading: loadingCompanies } = useQuery({
    queryKey: ['companies-comparison-list'],
    queryFn: () => api.getCompanies(),
  });

  const [selectedIds, setSelectedIds] = useState<number[]>([1, 2, 3]);

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter(i => i !== id));
      }
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const { data: comparisonData, isLoading: loadingComparison } = useQuery({
    queryKey: ['comparison-data', selectedIds],
    queryFn: () => api.getComparison(selectedIds),
    enabled: selectedIds.length > 0,
  });

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Stock Intelligence Comparison</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Compare close returns, volume metrics, order flow pressure, and news frequency</p>
      </div>

      {/* Multi-Select Pills */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Select Companies to Compare</h3>
        </div>
        {loadingCompanies ? (
          <SkeletonLoader rows={2} />
        ) : (
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            {companies?.map((c) => {
              const isSelected = selectedIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleSelect(c.id)}
                  className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px', fontSize: '12.5px' }}
                >
                  {isSelected && <Check size={14} />}
                  <span>{c.symbol} ({c.sector})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Comparison Grid & Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Head-to-Head Analytics Comparison</h3>
        </div>

        {loadingComparison || !comparisonData ? (
          <SkeletonLoader rows={6} />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Metric / Indicator</th>
                  {comparisonData.companies.map((item: CompanyComparisonItem) => (
                    <th key={item.company.id} style={{ fontSize: '14px', fontWeight: 700 }}>
                      {item.company.symbol}
                      <span style={{ display: 'block', fontSize: '11px', fontWeight: 400, color: 'var(--text-muted)' }}>
                        {item.company.sector}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>Latest Close Price</td>
                  {comparisonData.companies.map((item: CompanyComparisonItem) => (
                    <td key={item.company.id} style={{ fontWeight: 700 }}>
                      {formatCurrency(item.latest_close)}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td style={{ fontWeight: 600 }}>Close Return %</td>
                  {comparisonData.companies.map((item: CompanyComparisonItem) => (
                    <td key={item.company.id} style={{ color: (item.close_return_pct || 0) >= 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                      {formatPercent(item.close_return_pct)}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td style={{ fontWeight: 600 }}>30-Day Avg Volume</td>
                  {comparisonData.companies.map((item: CompanyComparisonItem) => (
                    <td key={item.company.id}>
                      {formatNumber(item.avg_volume)}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td style={{ fontWeight: 600 }}>Volume Anomaly Status</td>
                  {comparisonData.companies.map((item: CompanyComparisonItem) => (
                    <td key={item.company.id}>
                      {item.volume_anomaly ? (
                        <span className="badge badge-red">Spike (&ge; 2x Avg)</span>
                      ) : (
                        <span className="badge badge-gray">Normal</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td style={{ fontWeight: 600 }}>Order Flow Pressure Score</td>
                  {comparisonData.companies.map((item: CompanyComparisonItem) => (
                    <td key={item.company.id}>
                      <span className={`badge ${item.pressure_score > 0 ? 'badge-green' : 'badge-amber'}`}>
                        {item.pressure_score > 0 ? `+${item.pressure_score}` : item.pressure_score}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td style={{ fontWeight: 600 }}>Crawled News Count</td>
                  {comparisonData.companies.map((item: CompanyComparisonItem) => (
                    <td key={item.company.id}>
                      <span className="badge badge-blue">{item.news_count_30d} Articles</span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
