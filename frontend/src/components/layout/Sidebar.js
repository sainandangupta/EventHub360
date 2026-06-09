import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const navSections = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', icon: '📊', path: '/dashboard', roles: ['user', 'manager', 'hr', 'admin'] },
    ]
  },
  {
    title: 'Leave Management',
    items: [
      { label: 'Apply Leave', icon: '✏️', path: '/leave/apply', roles: ['user', 'manager'] },
      { label: 'My Leaves', icon: '📅', path: '/leave/history', roles: ['user', 'manager', 'hr', 'admin'] },
      { label: 'Leave Balance', icon: '📈', path: '/leave/balance', roles: ['user', 'manager', 'hr', 'admin'] },
      { label: 'Pending Approvals', icon: '✅', path: '/leave/approvals', roles: ['manager', 'hr'] },
      { label: 'Leave Reports', icon: '📑', path: '/leave/reports', roles: ['hr', 'admin'] },
    ]
  },
  {
    title: 'Organization',
    items: [
      { label: 'Employees', icon: '👥', path: '/employees', roles: ['user', 'manager', 'hr', 'admin'] },
      { label: 'Departments', icon: '🏢', path: '/departments', roles: ['user', 'manager', 'hr', 'admin'] },
      { label: 'Skills', icon: '🎯', path: '/skills', roles: ['user', 'manager', 'hr', 'admin'] },
    ]
  },
  {
    title: 'Administration',
    items: [
      { label: 'Admin Dashboard', icon: '⚙️', path: '/admin', roles: ['admin'] },
      { label: 'User Management', icon: '🔑', path: '/admin/users', roles: ['admin'] },
    ]
  },
];

export default function Sidebar({ isOpen, onToggle, user }) {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;
  const userRole = (user?.role || 'user').toLowerCase();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">LM</div>
        <div className="sidebar-brand">
          <span className="sidebar-brand-name">LeaveManager</span>
          <span className="sidebar-brand-sub">Employee Portal</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navSections.map((section) => {
          const visibleItems = section.items.filter(item => item.roles.includes(userRole));
          if (visibleItems.length === 0) return null;

          return (
            <React.Fragment key={section.title}>
              <div className="sidebar-section-title">{section.title}</div>
              {visibleItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-link ${currentPath === item.path ? 'active' : ''}`}
                  onClick={() => {
                    if (window.innerWidth <= 1024) onToggle?.();
                  }}
                >
                  <span className="sidebar-link-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user-info">
          <div className="sidebar-user-avatar">{getInitials(user?.name)}</div>
          <div className="sidebar-user-details">
            <span className="sidebar-user-name">{user?.name || 'User'}</span>
            <span className="sidebar-user-role">{userRole}</span>
          </div>
        </div>
        <button className="sidebar-link" onClick={handleLogout} style={{ width: '100%', color: 'var(--color-danger-light)' }}>
          <span className="sidebar-link-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
