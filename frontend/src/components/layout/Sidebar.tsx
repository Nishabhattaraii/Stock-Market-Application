import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, Newspaper, ArrowLeftRight, 
  Activity, CheckSquare, Users, Shield, X
} from 'lucide-react';
import { useAuth } from '../../app/providers';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'Viewer';

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Analyst', 'Viewer'] },
    { to: '/companies', label: 'Companies', icon: Building2, roles: ['Admin', 'Analyst', 'Viewer'] },
    { to: '/news', label: 'News Feed', icon: Newspaper, roles: ['Admin', 'Analyst', 'Viewer'] },
    { to: '/comparison', label: 'Comparison', icon: ArrowLeftRight, roles: ['Admin', 'Analyst', 'Viewer'] },
    { to: '/crawls', label: 'Monitoring', icon: Activity, roles: ['Admin', 'Analyst'] },
    { to: '/corrections', label: 'Corrections', icon: CheckSquare, roles: ['Admin', 'Analyst'] },
    { to: '/users', label: 'User Management', icon: Users, roles: ['Admin'] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={onClose} 
          aria-hidden="true" 
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Shield size={20} className="text-slate-800" />
          <span className="sidebar-logo">NEPSE Intelligence</span>
          {onClose && (
            <button 
              onClick={onClose}
              className="sidebar-close-btn"
              aria-label="Close Sidebar Menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {filteredItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                end={item.to === '/'}
                onClick={onClose}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-muted)' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Nepal Stock Market</div>
          <div>Intelligence Monolith v1.0</div>
        </div>
      </aside>
    </>
  );
};
