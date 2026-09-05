import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Building2, Newspaper, Activity, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { api } from '../lib/api';
import { MetricCard } from '../components/common/MetricCard';
import { PriceVolumeChart } from '../components/charts/PriceVolumeChart';
import { NewsTable } from '../components/tables/NewsTable';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { formatCurrency, formatPercent } from '../lib/formatters';

export const DashboardPage: React.FC = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  const { data: companies, isLoading: loadingCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => api.getCompanies(),
  });

  const { data: news, isLoading: loadingNews } = useQuery({
    queryKey: ['news-dashboard'],
    queryFn: () => api.getNews(undefined, undefined),
  });

  const { data: crawls } = useQuery({
    queryKey: ['crawls'],
    queryFn: () => api.getCrawls(),
  });

  // Default to first company if available
  const activeCompanyId = selectedCompanyId || (companies && companies.length > 0 ? companies[0].id : 1);

  const { data: companyAnalysis, isLoading: loadingAnalysis } = useQuery({
    queryKey: ['company-analysis', activeCompanyId],
    queryFn: () => api.getCompanyAnalysis(activeCompanyId),
    enabled: !!activeCompanyId,
  });

  const { data: companyPrices } = useQuery({
    queryKey: ['company-prices', activeCompanyId],
    queryFn: () => api.getCompanyPrices(activeCompanyId, 30),
    enabled: !!activeCompanyId,
  });

  const latestSnap = companyAnalysis?.latest_snapshot;

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Market Intelligence Dashboard</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Nepal Stock Exchange (NEPSE) Realtime Monitor & Crawl Analytics</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid-kpi">
        <MetricCard
          label="Tracked Companies"
          value={companies?.length || 10}
          subtext="NEPSE Core Watchlist"
          icon={Building2}
        />
        <MetricCard
          label="Processed News Articles"
          value={news?.length || 0}
          subtext="Multi-label Crawled Articles"
          icon={Newspaper}
        />
        <MetricCard
          label="Volume Anomaly Status"
          value={latestSnap?.volume_anomaly ? 'FLAGGED (>= 2x Avg)' : 'Normal'}
          subtext={latestSnap?.volume_anomaly ? 'High turnover spike detected' : 'Within 30-day baseline'}
          icon={AlertTriangle}
          trend={latestSnap?.volume_anomaly ? 'down' : 'neutral'}
        />
        <MetricCard
          label="Latest Crawl Run"
          value={crawls && crawls.length > 0 ? crawls[0].status.toUpperCase() : 'COMPLETED'}
          subtext={crawls && crawls.length > 0 ? `Portal: ${crawls[0].portal}` : 'All crawlers active'}
          icon={Activity}
          trend="up"
        />
      </div>

      {/* Main Grid */}
      <div className="grid-3">
        {/* Left 2 Cols: Performance Chart & Stock Selector */}
        <div>
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Stock Performance & Volume Trend</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Historical Close Price (NPR) & Trading Volume</p>
              </div>

              {/* Stock Selector Pill */}
              <select
                className="input"
                style={{ width: '180px', padding: '6px 10px', fontSize: '13px' }}
                value={activeCompanyId}
                onChange={(e) => setSelectedCompanyId(Number(e.target.value))}
              >
                {companies?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.symbol} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            {loadingAnalysis || !companyPrices ? (
              <SkeletonLoader rows={5} />
            ) : (
              <div>
                <div className="flex items-center gap-4" style={{ marginBottom: '16px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Latest Close</span>
                    <span style={{ fontSize: '18px', fontWeight: 700 }}>{formatCurrency(latestSnap?.close_price)}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>VWAP (Floorsheet)</span>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#16a34a' }}>{formatCurrency(latestSnap?.vwap)}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Pressure Score</span>
                    <span style={{ fontSize: '16px', fontWeight: 600 }}>{latestSnap?.pressure_score || 0.0}</span>
                  </div>
                  <Link
                    to={`/companies/${activeCompanyId}`}
                    className="btn btn-secondary"
                    style={{ marginLeft: 'auto', fontSize: '12px', padding: '6px 12px' }}
                  >
                    <span>Full Analytics</span>
                    <ArrowUpRight size={14} />
                  </Link>
                </div>

                <PriceVolumeChart prices={companyPrices} />
              </div>
            )}
          </div>

          {/* Recent News Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Market News Feed</h3>
              <Link to="/news" style={{ fontSize: '12.5px', color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 500 }}>
                View All News &rarr;
              </Link>
            </div>
            {loadingNews ? <SkeletonLoader rows={4} /> : <NewsTable articles={news?.slice(0, 5) || []} />}
          </div>
        </div>

        {/* Right 1 Col: Company Watchlist Quick List */}
        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Core NEPSE Watchlist</h3>
            </div>
            {loadingCompanies ? (
              <SkeletonLoader rows={6} />
            ) : (
              <div className="table-container" style={{ border: 'none' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Symbol</th>
                      <th>Sector</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies?.map((c) => (
                      <tr key={c.id} style={{ backgroundColor: c.id === activeCompanyId ? '#f1f5f9' : 'transparent' }}>
                        <td style={{ fontWeight: 700 }}>{c.symbol}</td>
                        <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{c.sector}</td>
                        <td>
                          <Link
                            to={`/companies/${c.id}`}
                            className="btn btn-secondary"
                            style={{ padding: '2px 8px', fontSize: '11px' }}
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
