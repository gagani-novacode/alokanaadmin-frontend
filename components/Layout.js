import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, ShoppingBag, Users, FileText } from 'lucide-react';

export default function Layout({ children, title }) {
  const router = useRouter();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Tickets', path: '/orders', icon: ShoppingBag },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'System Logs', path: '/logs', icon: FileText },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">A</div>
          <div className="sidebar-logo-text">Andarayaya <span>Admin</span></div>
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
        <div className="sidebar-footer">
          Andarayaya Ticketing v1.0
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h1 className="topbar-title">{title || 'Dashboard'}</h1>
          {/* <div className="status-indicator">
            <span className="status-dot"></span>
            Backend Connected
          </div> */}
        </header>
        <div className="page-body">
          {children}
        </div>
      </main>
    </div>
  );
}
