import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getOrders } from '../services/orderService';
import { getLowStockMedicines } from '../services/medicineService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockMeds, setLowStockMeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, ordersRes, lowStockRes] = await Promise.all([
          getDashboardStats(),
          getOrders({ limit: 6, sort: 'createdAt:desc' }),
          getLowStockMedicines(),
        ]);
        setStats(statsRes.data.data);
        setRecentOrders(ordersRes.data.data);
        setLowStockMeds(lowStockRes.data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  const STAT_CARDS = [
    { icon: '📋', label: 'Total Order', value: stats?.orders?.total ?? 0, iconClass: 'blue' },
    { icon: '⏳', label: 'Pending', value: stats?.orders?.pending ?? 0, iconClass: 'amber' },
    { icon: '⚙️', label: 'Diproses', value: stats?.orders?.processing ?? 0, iconClass: 'indigo' },
    { icon: '✅', label: 'Selesai', value: stats?.orders?.completed ?? 0, iconClass: 'green' },
    { icon: '💊', label: 'Total Obat', value: stats?.medicines?.total ?? 0, iconClass: 'blue' },
    { icon: '⚠️', label: 'Stok Rendah', value: stats?.medicines?.lowStock ?? 0, iconClass: 'red' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Alert low stock */}
      {(stats?.medicines?.lowStock ?? 0) > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: 24 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <strong>{stats.medicines.lowStock} obat</strong> memiliki stok di bawah batas minimum.{' '}
            <Link to="/medicines?lowStock=true" style={{ color: 'inherit', textDecoration: 'underline' }}>Lihat daftar obat</Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        {STAT_CARDS.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className={`stat-icon ${s.iconClass}`}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Recent Orders */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Order Terbaru</h2>
            <Link to="/orders" className="btn btn-ghost btn-sm">Lihat Semua →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>Belum ada order</h3>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>No. Order</th>
                    <th>Poliklinik</th>
                    <th>Tanggal</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td>
                        <Link to={`/orders/${order.id}`} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td data-label="Poliklinik">{order.polyclinic}</td>
                      <td data-label="Tanggal" className="text-muted">
                        {new Date(order.orderDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td data-label="Status"><StatusBadge status={order.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>⚠️ Stok Rendah</h2>
            <Link to="/medicines" className="btn btn-ghost btn-sm">Semua →</Link>
          </div>
          {lowStockMeds.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-state-icon">✅</div>
              <h3>Semua stok aman</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {lowStockMeds.slice(0, 8).map(med => {
                const pct = med.minStock > 0 ? Math.min((med.stock / med.minStock) * 100, 100) : 0;
                const fillClass = pct === 0 ? 'critical' : pct < 50 ? 'critical' : 'warning';
                return (
                  <div key={med.id} style={{ padding: '10px 12px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{med.name}</span>
                      <span className={`badge ${med.stock === 0 ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: 11 }}>
                        {med.stock} {med.unit}
                      </span>
                    </div>
                    <div className="stock-bar">
                      <div className={`stock-bar-fill ${fillClass}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 3 }}>Min: {med.minStock} {med.unit}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Aksi Cepat</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/orders/new" className="btn btn-primary">📝 Buat Order Baru</Link>
          <Link to="/orders?status=pending" className="btn btn-warning">⏳ Lihat Order Pending</Link>
          <Link to="/orders?status=processing" className="btn btn-secondary">⚙️ Lihat Sedang Diproses</Link>
          <Link to="/medicines" className="btn btn-secondary">💊 Kelola Obat</Link>
        </div>
      </div>
    </div>
  );
}
