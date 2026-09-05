import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Building2, Search, Filter, ArrowUpRight, Activity } from 'lucide-react';
import { api } from '../lib/api';
import { SkeletonLoader } from '../components/common/SkeletonLoader';

export const CompaniesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');

  const { data: companies, isLoading } = useQuery({
    queryKey: ['companies-list-full'],
    queryFn: () => api.getCompanies(),
  });

  const sectors = Array.from(new Set(companies?.map(c => c.sector) || []));

  const filteredCompanies = companies?.filter(c => {
    const matchesSearch = c.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = !selectedSector || c.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Listed Companies Directory</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            NEPSE tracked equities, commercial banks, telecom & manufacturing entities
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2" style={{ flex: 1, minWidth: '240px' }}>
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input"
              style={{ width: '100%', fontSize: '13px' }}
              placeholder="Search by Symbol or Company Name (e.g. NABIL, Telecom)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            <select
              className="input"
              style={{ width: '200px', padding: '6px 10px', fontSize: '13px' }}
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
            >
              <option value="">All Sectors</option>
              {sectors.map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Building2 size={18} />
            <h3 className="card-title">Tracked Equities ({filteredCompanies?.length || 0})</h3>
          </div>
        </div>

        {isLoading ? (
          <SkeletonLoader rows={8} />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Company Name</th>
                  <th>Sector</th>
                  <th>Monitoring Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies?.map((comp) => (
                  <tr key={comp.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {comp.symbol}
                    </td>
                    <td style={{ fontWeight: 500 }}>{comp.name}</td>
                    <td>
                      <span className="badge badge-blue">{comp.sector}</span>
                    </td>
                    <td>
                      <span className="badge badge-green">Active Monitoring</span>
                    </td>
                    <td>
                      <Link
                        to={`/companies/${comp.id}`}
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                      >
                        <span>View Analytics</span>
                        <ArrowUpRight size={13} />
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
  );
};
