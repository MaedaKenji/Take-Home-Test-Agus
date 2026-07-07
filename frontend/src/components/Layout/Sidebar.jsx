import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', icon: '📊', label: 'Dashboard', exact: true },
  { to: '/orders', icon: '📋', label: 'Order Obat' },
  { to: '/medicines', icon: '💊', label: 'Manajemen Obat' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏥</div>
          <div className="sidebar-logo-text">
            <h2>Farmasi RSUD</h2>
            <span>Sistem Order Obat</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu Utama</div>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-info">
          <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 2 }}>
            RSUD Syarifah Ambami
          </div>
          <div>Rato Ebu Bangkalan</div>
        </div>
      </div>
    </aside>
  );
}
