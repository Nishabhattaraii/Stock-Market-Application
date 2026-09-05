import {
  User, Company, DailyPrice, NewsArticle, NewsCorrection,
  CrawlRun, CompanyAnalysisDetail, ComparisonOut
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://stock-market-application-production.up.railway.app';
const API_BASE = `${BASE_URL.replace(/\/$/, '')}/api/v1`;

export function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      removeAuthToken();
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || 'API request failed');
  }

  return response.json();
}

export const api = {
  // Auth
  login: async (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });
    if (!res.ok) throw new Error('Invalid login credentials');
    return res.json();
  },

  getCurrentUser: () => request<User>('/auth/me'),

  // Companies
  getCompanies: () => request<Company[]>('/companies'),
  getCompany: (id: number) => request<Company>(`/companies/${id}`),
  getCompanyPrices: (id: number, limit = 30) => request<DailyPrice[]>(`/companies/${id}/prices?limit=${limit}`),
  getCompanyNews: (id: number) => request<NewsArticle[]>(`/companies/${id}/news`),
  getCompanyAnalysis: (id: number) => request<CompanyAnalysisDetail>(`/companies/${id}/analysis`),

  // News
  getNews: (companyId?: number, source?: string) => {
    const params = new URLSearchParams();
    if (companyId) params.append('company_id', companyId.toString());
    if (source) params.append('source', source);
    return request<NewsArticle[]>(`/news?${params.toString()}`);
  },

  recategorizeNews: (articleId: number, newCompanyId: number, oldCompanyId?: number, reason?: string) =>
    request<NewsCorrection>(`/news/${articleId}/recategorize`, {
      method: 'POST',
      body: JSON.stringify({
        new_company_id: newCompanyId,
        old_company_id: oldCompanyId,
        correction_reason: reason,
      }),
    }),

  getCorrections: () => request<NewsCorrection[]>('/news/corrections'),

  // Crawls
  getCrawls: () => request<CrawlRun[]>('/crawls'),
  triggerCrawl: (portal: string) =>
    request<{ message: string; results: any[] }>('/crawls/trigger', {
      method: 'POST',
      body: JSON.stringify({ portal }),
    }),

  // Analysis Comparison
  getComparison: (companyIds: number[]) => {
    const params = companyIds.map(id => `company_ids=${id}`).join('&');
    return request<ComparisonOut>(`/analysis/comparison?${params}`);
  },

  // Users Management
  getUsers: () => request<User[]>('/users'),
  createUser: (user: { name: string; email: string; password: string; role: string }) =>
    request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    }),
  updateUserStatus: (id: number, is_active: boolean) =>
    request<User>(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active }),
    }),
};

export async function downloadExport(endpoint: string, filename: string): Promise<void> {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE}${endpoint}`, { headers });
  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.detail || 'Export download failed');
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
