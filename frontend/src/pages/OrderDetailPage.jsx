import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getOrderById, updateOrderStatus, updateOrderItems } from '../services/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

const VALID_TRANSITIONS = {
  pending: ['processing', 'cancelled'],
  processing: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

const STATUS_ACTIONS = {
  processing: { label: '⚙️ Proses Order', className: 'btn-primary' },
  completed: { label: '✅ Selesaikan Order', className: 'btn-success' },
  cancelled: { label: '✕ Batalkan Order', className: 'btn-danger' },
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusDialog, setStatusDialog] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [approvalMode, setApprovalMode] = useState(false);
  const [approvedQtys, setApprovedQtys] = useState({});
  const [approvalLoading, setApprovalLoading] = useState(false);

  const load = async () => {
    try {
      const res = await getOrderById(id);
      setOrder(res.data.data);
    } catch {
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    if (order?.items) {
      const init = {};
      order.items.forEach(item => { init[item.id] = item.quantityApproved ?? item.quantityRequested; });
      setApprovedQtys(init);
    }
  }, [order]);

  const handleStatusChange = async () => {
    setStatusLoading(true);
    try {
      await updateOrderStatus(id, statusDialog);
      toast.success(`Status berhasil diubah ke "${statusDialog}"`);
      setStatusDialog(null);
      load();
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSaveApproval = async () => {
    setApprovalLoading(true);
    try {
      const items = Object.entries(approvedQtys).map(([itemId, quantityApproved]) => ({ itemId, quantityApproved: parseInt(quantityApproved) }));
      await updateOrderItems(id, items);
      toast.success('Persetujuan jumlah berhasil disimpan');
      setApprovalMode(false);
      load();
    } finally {
      setApprovalLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!order) return null;

  const transitions = VALID_TRANSITIONS[order.status] || [];
  const nonCancelTransitions = transitions.filter(t => t !== 'cancelled');
  const canCancel = transitions.includes('cancelled');

  return (
    <div className="animate-fade-in" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <h1>{order.orderNumber}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p>Dibuat {new Date(order.createdAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Kembali</button>
          {order.status === 'pending' && (
            <Link to={`/orders/${id}/edit`} className="btn btn-ghost">✏️ Edit Order</Link>
          )}
        </div>
      </div>

      {/* Info Order */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>📋 Informasi Order</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { label: 'Nomor Order', value: order.orderNumber },
            { label: 'Poliklinik', value: order.polyclinic },
            { label: 'Tanggal Order', value: new Date(order.orderDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
            { label: 'Dipesan Oleh', value: order.requestedBy || '-' },
          ].map(info => (
            <div key={info.label} style={{ padding: '12px 16px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{info.label}</div>
              <div style={{ fontWeight: 600 }}>{info.value}</div>
            </div>
          ))}
        </div>
        {order.notes && (
          <div style={{ marginTop: 12, padding: '12px 16px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Catatan</div>
            <div style={{ fontSize: 14 }}>{order.notes}</div>
          </div>
        )}
      </div>

      {/* Detail Obat */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700 }}>💊 Detail Obat ({order.items?.length} item)</h2>
          {order.status === 'processing' && !approvalMode && (
            <button className="btn btn-secondary btn-sm" onClick={() => setApprovalMode(true)}>📝 Isi Jumlah Disetujui</button>
          )}
          {approvalMode && (
            <div className="flex gap-2">
              <button className="btn btn-secondary btn-sm" onClick={() => setApprovalMode(false)}>Batal</button>
              <button className="btn btn-success btn-sm" onClick={handleSaveApproval} disabled={approvalLoading}>
                {approvalLoading ? 'Menyimpan...' : '💾 Simpan'}
              </button>
            </div>
          )}
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nama Obat</th>
                <th>Satuan</th>
                <th>Diminta</th>
                <th>Disetujui</th>
                <th>Stok Saat Ini</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, idx) => (
                <tr key={item.id}>
                  <td className="text-muted">{idx + 1}</td>
                  <td data-label="Obat" style={{ fontWeight: 600 }}>{item.medicine?.name}</td>
                  <td data-label="Satuan" className="text-muted">{item.medicine?.unit}</td>
                  <td data-label="Diminta" style={{ fontWeight: 600 }}>{item.quantityRequested}</td>
                  <td data-label="Disetujui">
                    {approvalMode ? (
                      <input
                        type="number"
                        className="form-control"
                        style={{ width: 90 }}
                        value={approvedQtys[item.id] ?? item.quantityRequested}
                        min={0}
                        max={item.quantityRequested}
                        onChange={e => setApprovedQtys(prev => ({ ...prev, [item.id]: e.target.value }))}
                      />
                    ) : (
                      <span style={{ fontWeight: 600, color: item.quantityApproved !== null ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                        {item.quantityApproved ?? '-'}
                      </span>
                    )}
                  </td>
                  <td data-label="Stok">
                    <span style={{ color: (item.medicine?.stock ?? 0) <= 0 ? 'var(--color-danger)' : 'var(--color-text-secondary)' }}>
                      {item.medicine?.stock ?? 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Actions */}
      {transitions.length > 0 && (
        <div className="card">
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>🔄 Ubah Status Order</h2>
          <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
            {nonCancelTransitions.map(t => (
              <button key={t} className={`btn ${STATUS_ACTIONS[t]?.className || 'btn-secondary'}`} onClick={() => setStatusDialog(t)}>
                {STATUS_ACTIONS[t]?.label || t}
              </button>
            ))}
            {canCancel && (
              <button className="btn btn-danger" onClick={() => setStatusDialog('cancelled')}>
                {STATUS_ACTIONS.cancelled.label}
              </button>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!statusDialog}
        title="Konfirmasi Perubahan Status"
        message={`Yakin ingin mengubah status order "${order.orderNumber}" ke "${statusDialog}"?${statusDialog === 'completed' ? ' Stok obat akan dikurangi sesuai jumlah yang disetujui.' : ''}`}
        confirmLabel="Ya, Ubah Status"
        confirmClass={statusDialog === 'cancelled' ? 'btn-danger' : statusDialog === 'completed' ? 'btn-success' : 'btn-primary'}
        onConfirm={handleStatusChange}
        onCancel={() => setStatusDialog(null)}
        loading={statusLoading}
      />
    </div>
  );
}
