import React, { useState, useEffect } from 'react';
import { LogOut, User as UserIcon, Radio } from 'lucide-react';
import { useAuth } from '../../app/providers';
import { wsClient } from '../../lib/websocket';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [wsOnline, setWsOnline] = useState(wsClient.getStatus());

  useEffect(() => {
    wsClient.connect();
    const unsubscribe = wsClient.subscribe((data) => {
      if (data.event === 'status') {
        setWsOnline(data.status === 'online');
      }
    });
    return unsubscribe;
  }, []);

  const getBadgeClass = (role?: string) => {
    switch (role) {
      case 'Admin': return 'badge-red';
      case 'Analyst': return 'badge-blue';
      default: return 'badge-gray';
    }
  };

  return (
    <header className="top-header">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          <Radio size={14} style={{ color: wsOnline ? '#16a34a' : '#94a3b8' }} />
          <span>Realtime Feed: <strong>{wsOnline ? 'Connected' : 'Connecting...'}</strong></span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <span className={`badge ${getBadgeClass(user.role)}`}>{user.role}</span>
            <div className="flex items-center gap-2" style={{ fontSize: '13px', fontWeight: 500 }}>
              <UserIcon size={16} />
              <span>{user.name}</span>
            </div>
            <button
              onClick={logout}
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '12px' }}
              title="Sign Out"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
