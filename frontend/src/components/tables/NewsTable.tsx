import React from 'react';
import { ExternalLink, Edit2 } from 'lucide-react';
import { NewsArticle } from '../../types';
import { formatDate } from '../../lib/formatters';

interface NewsTableProps {
  articles: NewsArticle[];
  onCorrectTag?: (article: NewsArticle) => void;
  canEdit?: boolean;
}

const getExternalUrl = (url: string) => {
  if (!url) return '#';
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url.replace(/^\/+/, '')}`;
};

export const NewsTable: React.FC<NewsTableProps> = ({ articles, onCorrectTag, canEdit }) => {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Headline</th>
            <th>Source</th>
            <th>Published</th>
            <th>Company Tags</th>
            <th>Confidence</th>
            {canEdit && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {articles.map((art) => (
            <tr key={art.id}>
              <td style={{ maxWidth: '400px' }}>
                <a
                  href={getExternalUrl(art.canonical_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>{art.headline}</span>
                  <ExternalLink size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                </a>
              </td>
              <td><span className="badge badge-gray">{art.source}</span></td>
              <td style={{ whiteSpace: 'nowrap' }}>{formatDate(art.published_at)}</td>
              <td>
                <div className="flex items-center gap-1" style={{ flexWrap: 'wrap' }}>
                  {art.tags && art.tags.length > 0 ? (
                    art.tags.map((t) => (
                      <span key={t.id} className="badge badge-blue">
                        {t.company?.symbol || `ID:${t.company_id}`}
                      </span>
                    ))
                  ) : (
                    <span className="badge badge-gray">Uncategorized</span>
                  )}
                </div>
              </td>
              <td>
                {art.tags && art.tags.length > 0 ? (
                  <span className={`badge ${art.tags[0].confidence >= 0.8 ? 'badge-green' : 'badge-amber'}`}>
                    {(art.tags[0].confidence * 100).toFixed(0)}% ({art.tags[0].method})
                  </span>
                ) : (
                  '—'
                )}
              </td>
              {canEdit && (
                <td>
                  {onCorrectTag && (
                    <button
                      onClick={() => onCorrectTag(art)}
                      className="btn btn-secondary"
                      style={{ padding: '3px 8px', fontSize: '11.5px' }}
                      title="Correct Company Tag"
                    >
                      <Edit2 size={12} />
                      <span>Correct</span>
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
