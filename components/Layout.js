import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, ShoppingBag, Users, FileText, LogOut, User } from 'lucide-react';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children, title }) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Tickets', path: '/orders', icon: ShoppingBag },
    // { label: 'Customers', path: '/customers', icon: Users },
    { label: 'System Logs', path: '/logs', icon: FileText },
  ];

  return (
    <ProtectedRoute>
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">A</div>
            <div className="sidebar-logo-text">Alokana <span>Admin</span></div>
          </div>
          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.path;
              return (
                <Link key={item.path} href={item.path} className={`nav-item ${isActive ? 'active' : ''}`}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '13px' }}>
              <User size={16} />
              <span>LoggedIn: <strong style={{ color: '#e2e8f0' }}>{user?.username || 'admin'}</strong></span>
            </div>
            <button
              onClick={logout}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                marginTop: '4px'
              }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <main className="main-content">
          <header className="topbar">
            <h1 className="topbar-title">{title || 'Dashboard'}</h1>
          </header>
          <div className="page-body">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

