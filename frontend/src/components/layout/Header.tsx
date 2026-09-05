import React, { useState, useEffect } from 'react';
import { LogOut, User as UserIcon, Radio, Menu } from 'lucide-react';
import { useAuth } from '../../app/providers';
import { wsClient } from '../../lib/websocket';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
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
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="mobile-menu-btn"
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-2" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          <Radio size={14} style={{ color: wsOnline ? '#16a34a' : '#94a3b8', flexShrink: 0 }} />
          <span className="header-status-text">Realtime Feed: <strong>{wsOnline ? 'Connected' : 'Connecting...'}</strong></span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2 flex-wrap" style={{ justifyContent: 'flex-end' }}>
            <span className={`badge ${getBadgeClass(user.role)}`}>{user.role}</span>
            <div className="header-user-name flex items-center gap-1.5" style={{ fontSize: '13px', fontWeight: 500 }}>
              <UserIcon size={16} />
              <span>{user.name}</span>
            </div>
            <button
              onClick={logout}
              className="btn btn-secondary"
              style={{ padding: '4px 8px', fontSize: '12px' }}
              title="Sign Out"
            >
              <LogOut size={14} />
              <span className="header-logout-label">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
