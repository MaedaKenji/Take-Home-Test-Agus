import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getOrders, deleteOrder, updateOrderStatus } from '../services/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

const STATUSES = [
  { value: '', label: 'Semua Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Diproses' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get('status') || '';
  const date = searchParams.get('date') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (status) params.status = status;
      if (date) params.date = date;
      const res = await getOrders(params);
      setOrders(res.data.data);
      setMeta(res.data.meta);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status, date, page]);

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteOrder(deleteTarget.id);
      toast.success('Order berhasil dihapus');
      setDeleteTarget(null);
      load();
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancel = async (order) => {
    try {
      await updateOrderStatus(order.id, 'cancelled');
      toast.success('Order berhasil dibatalkan');
      load();
    } catch { /* handled */ }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Order Obat</h1>
          <p>{meta.total} order ditemukan</p>
        </div>
        <Link to="/orders/new" className="btn btn-primary">+ Buat Order</Link>
      </div>

      <div className="card">
        <div className="filter-bar">
          <select className="form-control" style={{ width: 180 }} value={status} onChange={e => setParam('status', e.target.value)}>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <input type="date" className="form-control" style={{ width: 180 }} value={date} onChange={e => setParam('date', e.target.value)} />
          {(status || date) && (
            <button className="btn btn-ghost btn-sm" onClick={() => setSearchParams({})}>✕ Reset Filter</button>
          )}
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>No. Order</th>
                    <th>Poliklinik</th>
                    <th>Tanggal Order</th>
                    <th>Jumlah Item</th>
                    <th>Dipesan Oleh</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>
                      <div className="empty-state-icon">📋</div>
                      <p style={{ color: 'var(--color-text-muted)' }}>Tidak ada order ditemukan</p>
                    </td></tr>
                  ) : orders.map(order => (
                    <tr key={order.id}>
                      <td data-label="No Order">
                        <Link to={`/orders/${order.id}`} style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td data-label="Poliklinik" style={{ fontWeight: 500 }}>{order.polyclinic}</td>
                      <td data-label="Tanggal" className="text-muted">
                        {new Date(order.orderDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </td>
                      <td data-label="Jumlah Item">
                        <span className="badge badge-info">{order.items?.length ?? 0} item</span>
                      </td>
                      <td data-label="Dipesan Oleh" className="text-muted">{order.requestedBy || '-'}</td>
                      <td data-label="Status"><StatusBadge status={order.status} /></td>
                      <td data-label="Aksi">
                        <div className="flex gap-2">
                          <Link to={`/orders/${order.id}`} className="btn btn-ghost btn-sm">👁️</Link>
                          {order.status === 'pending' && (
                            <Link to={`/orders/${order.id}/edit`} className="btn btn-secondary btn-sm">✏️</Link>
                          )}
                          {order.status === 'pending' && (
                            <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(order)}>🗑️</button>
                          )}
                          {(order.status === 'pending' || order.status === 'processing') && (
                            <button className="btn btn-ghost btn-sm" onClick={() => handleCancel(order)} title="Batalkan">✕</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="pagination">
                <button className="page-btn" disabled={page <= 1} onClick={() => setParam('page', page - 1)}>←</button>
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setParam('page', String(p))}>{p}</button>
                ))}
                <button className="page-btn" disabled={page >= meta.totalPages} onClick={() => setParam('page', page + 1)}>→</button>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Order"
        message={`Yakin ingin menghapus order "${deleteTarget?.orderNumber}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
