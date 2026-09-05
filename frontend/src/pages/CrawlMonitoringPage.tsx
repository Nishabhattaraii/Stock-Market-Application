import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Activity, Play, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../app/providers';
import { CrawlLogsTable } from '../components/tables/CrawlLogsTable';
import { SkeletonLoader } from '../components/common/SkeletonLoader';

export const CrawlMonitoringPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPortal, setSelectedPortal] = useState<string>('all');
  const isAdmin = user?.role === 'Admin';

  const { data: crawls, isLoading, refetch } = useQuery({
    queryKey: ['crawls-monitoring'],
    queryFn: () => api.getCrawls(),
    refetchInterval: 5000, // Auto refresh every 5 seconds
  });

  const triggerMutation = useMutation({
    mutationFn: (portal: string) => api.triggerCrawl(portal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crawls-monitoring'] });
      queryClient.invalidateQueries({ queryKey: ['news-list'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });

  const handleTriggerCrawl = () => {
    triggerMutation.mutate(selectedPortal);
  };

  const lastSuccessful = crawls?.find(c => c.status === 'completed');

  return (
    <div>
      <div className="page-header-flex">
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Crawler Monitoring & System Health</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Live background crawler tasks, rate limits, and crawl error logs</p>
        </div>

        <button onClick={() => refetch()} className="btn btn-secondary" style={{ padding: '6px 12px' }}>
          <RefreshCw size={14} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Control Panel (Admin Only) */}
      {isAdmin && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Activity size={18} />
              <h3 className="card-title">Manual Crawl Control Panel</h3>
            </div>
          </div>

          <div className="filter-toolbar">
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>Select Target Portal:</span>
              <select
                className="input responsive-select"
                style={{ padding: '6px 10px', fontSize: '13px' }}
                value={selectedPortal}
                onChange={(e) => setSelectedPortal(e.target.value)}
              >
                <option value="all">All Portals (Complete Sweep)</option>
                <option value="merolagani">MeroLagani.com</option>
                <option value="sharesansar">ShareSansar.com</option>
                <option value="nepsealpha">NepseAlpha.com</option>
                <option value="bizmandu">Bizmandu.com</option>
                <option value="market_data">NEPSE Market Data & Floorsheet</option>
              </select>
            </div>

            <button
              onClick={handleTriggerCrawl}
              className="btn btn-primary"
              disabled={triggerMutation.isPending}
            >
              <Play size={14} />
              <span>{triggerMutation.isPending ? 'Queuing Crawler Task...' : 'Trigger Immediate Crawl'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Crawl Summary Metrics */}
      <div className="grid-kpi">
        <div className="kpi-card">
          <span className="kpi-label">Last Successful Crawl</span>
          <div className="kpi-value" style={{ fontSize: '16px', color: '#16a34a' }}>
            {lastSuccessful ? `${lastSuccessful.portal} (#${lastSuccessful.id})` : 'None'}
          </div>
          <span className="kpi-subtext">Completed without errors</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Total Execution Runs</span>
          <div className="kpi-value">{crawls?.length || 0}</div>
          <span className="kpi-subtext">Logged background tasks</span>
        </div>
      </div>

      {/* Crawl Runs Execution Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Crawl Execution Log History</h3>
        </div>
        {isLoading ? <SkeletonLoader rows={6} /> : <CrawlLogsTable crawls={crawls || []} />}
      </div>
    </div>
  );
};
