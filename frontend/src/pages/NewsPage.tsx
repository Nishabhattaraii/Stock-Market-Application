import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Newspaper, Filter, Edit3, X, Check } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../app/providers';
import { NewsTable } from '../components/tables/NewsTable';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { NewsArticle, Company } from '../types';

export const NewsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | undefined>(undefined);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);

  const [newCompanyId, setNewCompanyId] = useState<number>(1);
  const [reason, setReason] = useState<string>('');

  const canEdit = user?.role === 'Admin' || user?.role === 'Analyst';

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => api.getCompanies(),
  });

  const { data: news, isLoading } = useQuery({
    queryKey: ['news-list', selectedCompanyId, selectedSource],
    queryFn: () => api.getNews(selectedCompanyId, selectedSource || undefined),
  });

  const correctionMutation = useMutation({
    mutationFn: (vars: { articleId: number; newCompId: number; oldCompId?: number; reason?: string }) =>
      api.recategorizeNews(vars.articleId, vars.newCompId, vars.oldCompId, vars.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-list'] });
      setEditingArticle(null);
      setReason('');
    },
  });

  const handleOpenCorrection = (art: NewsArticle) => {
    setEditingArticle(art);
    const oldId = art.tags && art.tags.length > 0 ? art.tags[0].company_id : (companies ? companies[0].id : 1);
    setNewCompanyId(oldId);
  };

  const handleSaveCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    const oldCompId = editingArticle.tags && editingArticle.tags.length > 0 ? editingArticle.tags[0].company_id : undefined;

    correctionMutation.mutate({
      articleId: editingArticle.id,
      newCompId: newCompanyId,
      oldCompId: oldCompId,
      reason: reason,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Market News & Intelligence Feed</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Crawled news articles categorized across NEPSE listed companies</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <Filter size={16} />
            <span>Filter News:</span>
          </div>

          <select
            className="input"
            style={{ width: '180px', padding: '6px 10px', fontSize: '13px' }}
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
          >
            <option value="">All Sources</option>
            <option value="MeroLagani">MeroLagani</option>
            <option value="ShareSansar">ShareSansar</option>
            <option value="NepseAlpha">NepseAlpha</option>
            <option value="Bizmandu">Bizmandu</option>
          </select>

          <select
            className="input"
            style={{ width: '220px', padding: '6px 10px', fontSize: '13px' }}
            value={selectedCompanyId || ''}
            onChange={(e) => setSelectedCompanyId(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">All Companies</option>
            {companies?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.symbol} - {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* News Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Articles ({news?.length || 0})</h3>
        </div>
        {isLoading ? (
          <SkeletonLoader rows={6} />
        ) : (
          <NewsTable
            articles={news || []}
            canEdit={canEdit}
            onCorrectTag={handleOpenCorrection}
          />
        )}
      </div>

      {/* Recategorization Modal */}
      {editingArticle && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', margin: '20px', padding: '24px' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div className="flex items-center gap-2">
                <Edit3 size={18} />
                <h3 className="card-title">Analyst Recategorize News Tag</h3>
              </div>
              <button onClick={() => setEditingArticle(null)} className="btn btn-secondary" style={{ padding: '4px' }}>
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '13px', fontWeight: 500, marginBottom: '16px', color: 'var(--text-primary)' }}>
              "{editingArticle.headline}"
            </p>

            <form onSubmit={handleSaveCorrection}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Assign Correct Company Label
                </label>
                <select
                  className="input"
                  value={newCompanyId}
                  onChange={(e) => setNewCompanyId(Number(e.target.value))}
                  required
                >
                  {companies?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.symbol} - {c.name} ({c.sector})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Correction Reason (Audit Log)
                </label>
                <textarea
                  className="input"
                  style={{ height: '80px', resize: 'vertical' }}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Article primarily concerns Nabil Bank quarterly profit rather than general banking index."
                />
              </div>

              <div className="flex justify-between gap-2">
                <button type="button" onClick={() => setEditingArticle(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={correctionMutation.isPending}>
                  <Check size={14} />
                  <span>{correctionMutation.isPending ? 'Saving...' : 'Save Correction'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
