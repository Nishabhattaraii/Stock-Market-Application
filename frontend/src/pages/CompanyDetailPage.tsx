import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Building2, TrendingUp, AlertCircle, FileText } from 'lucide-react';
import { api } from '../lib/api';
import { PriceVolumeChart } from '../components/charts/PriceVolumeChart';
import { VWAPChart } from '../components/charts/VWAPChart';
import { PressureGauge } from '../components/charts/PressureGauge';
import { BrokerBreakdownTable } from '../components/tables/BrokerBreakdownTable';
import { NewsTable } from '../components/tables/NewsTable';
import { PricesTable } from '../components/tables/PricesTable';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { formatCurrency, formatNumber } from '../lib/formatters';

export const CompanyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const companyId = Number(id);

  const { data: detail, isLoading } = useQuery({
    queryKey: ['company-detail', companyId],
    queryFn: () => api.getCompanyAnalysis(companyId),
    enabled: !isNaN(companyId),
  });

  const { data: news } = useQuery({
    queryKey: ['company-news-detail', companyId],
    queryFn: () => api.getCompanyNews(companyId),
    enabled: !isNaN(companyId),
  });

  const { data: prices } = useQuery({
    queryKey: ['company-prices-detail', companyId],
    queryFn: () => api.getCompanyPrices(companyId, 30),
    enabled: !isNaN(companyId),
  });

  if (isLoading || !detail) {
    return <SkeletonLoader rows={10} />;
  }

  const { company, latest_snapshot: snap, broker_breakdown: broker, vwap_comparison: vwapData } = detail;

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Link to="/" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px', marginBottom: '12px' }}>
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </Link>

        <div className="page-header-flex">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{company.symbol}</h1>
              <span className="badge badge-blue">{company.sector}</span>
              {snap?.volume_anomaly && <span className="badge badge-red">Volume Anomaly (&ge; 2x Avg)</span>}
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>{company.name}</p>
          </div>

          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Latest Market Price</span>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {formatCurrency(snap?.close_price)}
            </span>
          </div>
        </div>
      </div>

      {/* Snapshot Cards Header */}
      <div className="grid-kpi">
        <div className="kpi-card">
          <span className="kpi-label">VWAP (Floorsheet)</span>
          <div className="kpi-value" style={{ color: '#16a34a' }}>{formatCurrency(snap?.vwap)}</div>
          <span className="kpi-subtext">Volume Weighted Average Price</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Buy/Sell Pressure Score</span>
          <div className="kpi-value">{snap?.pressure_score || 0.0}</div>
          <span className="kpi-subtext">Normalized (-1.0 to +1.0)</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">30-Day Avg Volume</span>
          <div className="kpi-value">{formatNumber(snap?.volume_average)}</div>
          <span className="kpi-subtext">Baseline Turnover Metric</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Related News Count</span>
          <div className="kpi-value">{news?.length || 0}</div>
          <span className="kpi-subtext">Multi-label Crawled Articles</span>
        </div>
      </div>

      {/* Order Flow Pressure & VWAP Grid */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Buy / Sell Order Flow Pressure</h3>
          </div>
          <PressureGauge
            buyQty={snap?.buy_quantity || 0}
            sellQty={snap?.sell_quantity || 0}
            score={snap?.pressure_score || 0}
          />
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">VWAP vs Close Price Benchmark</h3>
          </div>
          <VWAPChart data={vwapData} />
        </div>
      </div>

      {/* Price & Volume Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">30-Day Price & Volume Movement</h3>
        </div>
        {prices && <PriceVolumeChart prices={prices} />}
      </div>

      {/* Broker Breakdown Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Floorsheet Broker Concentration Analysis</h3>
        </div>
        <BrokerBreakdownTable breakdown={broker} />
      </div>

      {/* Analytical Observations Card */}
      <div className="card" style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1' }}>
        <div className="card-header">
          <div className="flex items-center gap-2">
            <FileText size={18} style={{ color: '#0f172a' }} />
            <h3 className="card-title">Automated Market Intelligence Observations</h3>
          </div>
        </div>
        <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '8px' }}>
            • <strong>VWAP Deviation:</strong> The current market price of {formatCurrency(snap?.close_price)} is trading near the volume-weighted average price of {formatCurrency(snap?.vwap)}, indicating balanced institutional valuation.
          </p>
          <p style={{ marginBottom: '8px' }}>
            • <strong>Broker Activity:</strong> Broker concentration reveals dominant buy-side accumulation across key floorsheet transactions.
          </p>
          <p>
            • <strong>News Sentiment Impact:</strong> {news?.length || 0} news article(s) tagged for {company.symbol} in recent crawl runs.
          </p>
        </div>
      </div>

      {/* Related News Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Tagged News Articles</h3>
        </div>
        <NewsTable articles={news || []} />
      </div>

      {/* Historical Prices Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Daily Price Records</h3>
        </div>
        {prices && <PricesTable prices={prices} />}
      </div>
    </div>
  );
};
