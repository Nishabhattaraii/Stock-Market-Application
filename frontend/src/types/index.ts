export type Role = 'Admin' | 'Analyst' | 'Viewer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export interface Company {
  id: number;
  symbol: string;
  name: string;
  sector: string;
  is_active: boolean;
  created_at: string;
}

export interface DailyPrice {
  id: number;
  company_id: number;
  trading_date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  turnover?: number;
  source: string;
}

export interface NewsTag {
  id: number;
  company_id: number;
  company?: Company;
  confidence: number;
  method: string;
  created_at: string;
}

export interface NewsArticle {
  id: number;
  headline: string;
  body?: string;
  excerpt?: string;
  published_at: string;
  source: string;
  canonical_url: string;
  crawled_at: string;
  tags: NewsTag[];
}

export interface NewsCorrection {
  id: number;
  article_id: number;
  old_company_id?: number;
  new_company_id: number;
  old_confidence?: number;
  corrected_by: string;
  correction_reason?: string;
  created_at: string;
  article?: NewsArticle;
}

export interface CrawlError {
  id: number;
  crawl_run_id: number;
  url?: string;
  error_type: string;
  error_message: string;
  retry_count: number;
  created_at: string;
}

export interface CrawlRun {
  id: number;
  portal: string;
  status: 'pending' | 'running' | 'completed' | 'completed_with_errors' | 'failed';
  started_at: string;
  completed_at?: string;
  items_found: number;
  items_inserted: number;
  errors_count: number;
  triggered_by: string;
  errors: CrawlError[];
}

export interface AnalysisSnapshot {
  id: number;
  company_id: number;
  analysis_date: string;
  vwap?: number;
  close_price?: number;
  buy_quantity: number;
  sell_quantity: number;
  pressure_score: number;
  volume_average: number;
  volume_anomaly: boolean;
  news_count: number;
  next_day_return?: number;
  next_day_volume_change?: number;
  generated_at: string;
  company?: Company;
}

export interface BrokerBreakdownItem {
  broker_id: number;
  buy_quantity: number;
  sell_quantity: number;
  net_quantity: number;
  transaction_count: number;
  percentage_contribution: number;
}

export interface BrokerBreakdown {
  company_id: number;
  trading_date: string;
  top_buyers: BrokerBreakdownItem[];
  top_sellers: BrokerBreakdownItem[];
}

export interface CompanyComparisonItem {
  company: Company;
  latest_close?: number;
  close_return_pct?: number;
  avg_volume: number;
  volume_anomaly: boolean;
  news_count_30d: number;
  pressure_score: number;
}

export interface ComparisonOut {
  companies: CompanyComparisonItem[];
}

export interface CompanyAnalysisDetail {
  company: Company;
  latest_snapshot?: AnalysisSnapshot;
  snapshots: AnalysisSnapshot[];
  broker_breakdown?: BrokerBreakdown;
  vwap_comparison: Array<{ date: string; vwap: number; close: number }>;
}
