import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, UserPlus, Shield, Check, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../app/providers';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { formatDate } from '../lib/formatters';
import { Role } from '../types';

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('Viewer');
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => api.getUsers(),
  });

  const createUserMutation = useMutation({
    mutationFn: (vars: { name: string; email: string; password: string; role: string }) =>
      api.createUser(vars),
    onSuccess: () => {
      setErrorMsg('');
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      setShowModal(false);
      setName('');
      setEmail('');
      setPassword('');
      setRole('Viewer');
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to create user.');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (vars: { id: number; is_active: boolean }) =>
      api.updateUserStatus(vars.id, vars.is_active),
    onSuccess: () => {
      setErrorMsg('');
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to update user status.');
    },
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate({ name, email, password, role });
  };

  const getRoleBadge = (r: Role) => {
    switch (r) {
      case 'Admin': return 'badge-red';
      case 'Analyst': return 'badge-blue';
      default: return 'badge-gray';
    }
  };

  return (
    <div>
      <div className="page-header-flex">
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>User & Role Access Management</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Manage system user accounts and assign RBAC roles (Admin, Analyst, Viewer)</p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <UserPlus size={14} />
          <span>Add System User</span>
        </button>
      </div>

      {errorMsg && (
        <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#b91c1c', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Users size={18} />
            <h3 className="card-title">Registered Accounts</h3>
          </div>
        </div>

        {isLoading ? (
          <SkeletonLoader rows={5} />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Assigned Role</th>
                  <th>Account Status</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>#{u.id}</td>
                      <td style={{ fontWeight: 500 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td><span className={`badge ${getRoleBadge(u.role)}`}>{u.role}</span></td>
                      <td>
                        {u.is_active ? (
                          <span className="badge badge-green">Active</span>
                        ) : (
                          <span className="badge badge-red">Disabled</span>
                        )}
                      </td>
                      <td>{formatDate(u.created_at)}</td>
                      <td>
                        <button
                          onClick={() => {
                            if (isSelf && u.is_active) {
                              setErrorMsg('Cannot deactivate your own active session.');
                              return;
                            }
                            toggleStatusMutation.mutate({ id: u.id, is_active: !u.is_active });
                          }}
                          className={`btn ${u.is_active ? 'btn-secondary' : 'btn-primary'}`}
                          style={{ padding: '3px 8px', fontSize: '11.5px', opacity: isSelf && u.is_active ? 0.6 : 1 }}
                          disabled={toggleStatusMutation.isPending || (isSelf && u.is_active)}
                          title={isSelf && u.is_active ? 'Cannot deactivate your active session' : (u.is_active ? 'Make user inactive' : 'Activate user account')}
                        >
                          {u.is_active ? 'Make Inactive' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="card modal-content">
            <h3 className="card-title" style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              Create New System User
            </h3>

            <form onSubmit={handleCreateUser}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ram Shrestha"
                  required
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@nepse.com"
                  required
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Password
                </label>
                <input
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Role Assignment
                </label>
                <select
                  className="input"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                >
                  <option value="Viewer">Viewer (Read-only)</option>
                  <option value="Analyst">Analyst (Data + News Corrections)</option>
                  <option value="Admin">Admin (Full System Control)</option>
                </select>
              </div>

              <div className="flex justify-between gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={createUserMutation.isPending}>
                  <Check size={14} />
                  <span>{createUserMutation.isPending ? 'Creating...' : 'Create Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
