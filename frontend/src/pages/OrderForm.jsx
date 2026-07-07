import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMedicines } from '../services/medicineService';
import { createOrder, updateOrder, getOrderById } from '../services/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const POLYCLINICS = [
  'Poli Umum', 'Poli Gigi', 'Poli Anak', 'Poli Kandungan', 'Poli Penyakit Dalam',
  'Poli Bedah', 'Poli Jantung', 'Poli Mata', 'Poli THT', 'Poli Saraf', 'Poli Kulit',
  'Poli Ortopedi', 'IGD', 'Rawat Inap Lantai 1', 'Rawat Inap Lantai 2', 'ICU',
];

const EMPTY_ITEM = { medicineId: '', quantityRequested: 1, notes: '' };

export default function OrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEdit);
  const [form, setForm] = useState({
    polyclinic: '',
    orderDate: new Date().toISOString().split('T')[0],
    notes: '',
    requestedBy: '',
  });
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getMedicines().then(r => setMedicines(r.data.data));
  }, []);

  useEffect(() => {
    if (isEdit) {
      getOrderById(id).then(r => {
        const o = r.data.data;
        setForm({ polyclinic: o.polyclinic, orderDate: o.orderDate, notes: o.notes || '', requestedBy: o.requestedBy || '' });
        setItems(o.items.map(i => ({ medicineId: i.medicineId, quantityRequested: i.quantityRequested, notes: i.notes || '' })));
      }).finally(() => setPageLoading(false));
    }
  }, [id]);

  const addItem = () => setItems(prev => [...prev, { ...EMPTY_ITEM }]);
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));
  const updateItem = (idx, key, val) => setItems(prev => prev.map((item, i) => i === idx ? { ...item, [key]: val } : item));

  const validate = () => {
    const e = {};
    if (!form.polyclinic) e.polyclinic = 'Poliklinik wajib dipilih';
    if (!form.orderDate) e.orderDate = 'Tanggal order wajib diisi';
    if (items.length === 0) e.items = 'Minimal 1 item obat';
    items.forEach((item, idx) => {
      if (!item.medicineId) e[`item_${idx}_med`] = 'Pilih obat';
      if (!item.quantityRequested || item.quantityRequested < 1) e[`item_${idx}_qty`] = 'Jumlah harus > 0';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...form, items };
      if (isEdit) {
        await updateOrder(id, payload);
        toast.success('Order berhasil diupdate');
      } else {
        await createOrder(payload);
        toast.success('Order berhasil dibuat');
      }
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const getMedicineLabel = (med) => `${med.name} (${med.unit}) — Stok: ${med.stock}`;

  if (pageLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1>{isEdit ? 'Edit Order' : 'Buat Order Baru'}</h1>
          <p>{isEdit ? 'Ubah data pesanan obat' : 'Tambah pesanan obat dari poliklinik'}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Kembali</button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Info Order */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>📝 Informasi Order</h2>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">Poliklinik / Unit Pemesan</label>
              <select className={`form-control ${errors.polyclinic ? 'is-invalid' : ''}`} value={form.polyclinic} onChange={e => setForm(f => ({ ...f, polyclinic: e.target.value }))} required>
                <option value="">Pilih poliklinik</option>
                {POLYCLINICS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.polyclinic && <p className="form-error">{errors.polyclinic}</p>}
            </div>
            <div className="form-group">
              <label className="form-label required">Tanggal Order</label>
              <input type="date" className={`form-control ${errors.orderDate ? 'is-invalid' : ''}`} value={form.orderDate} onChange={e => setForm(f => ({ ...f, orderDate: e.target.value }))} required />
              {errors.orderDate && <p className="form-error">{errors.orderDate}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Dipesan Oleh</label>
              <input className="form-control" value={form.requestedBy} onChange={e => setForm(f => ({ ...f, requestedBy: e.target.value }))} placeholder="Nama petugas poli" />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Catatan</label>
              <textarea className="form-control" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Catatan tambahan (opsional)" rows={2} />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>💊 Daftar Obat yang Dipesan</h2>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>+ Tambah Obat</button>
          </div>
          {errors.items && <p className="form-error" style={{ marginBottom: 10 }}>{errors.items}</p>}

          <div className="order-item-list">
            {items.map((item, idx) => (
              <div key={idx} className="order-item-row">
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Pilih Obat</label>
                  <select
                    className={`form-control ${errors[`item_${idx}_med`] ? 'is-invalid' : ''}`}
                    value={item.medicineId}
                    onChange={e => updateItem(idx, 'medicineId', e.target.value)}
                  >
                    <option value="">-- Pilih obat --</option>
                    {medicines.map(m => (
                      <option key={m.id} value={m.id} disabled={m.stock === 0}>
                        {getMedicineLabel(m)}
                      </option>
                    ))}
                  </select>
                  {errors[`item_${idx}_med`] && <p className="form-error">{errors[`item_${idx}_med`]}</p>}
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Jumlah</label>
                  <input
                    type="number"
                    className={`form-control ${errors[`item_${idx}_qty`] ? 'is-invalid' : ''}`}
                    value={item.quantityRequested}
                    min="1"
                    onChange={e => updateItem(idx, 'quantityRequested', parseInt(e.target.value) || 1)}
                  />
                  {errors[`item_${idx}_qty`] && <p className="form-error">{errors[`item_${idx}_qty`]}</p>}
                </div>
                <button
                  type="button"
                  className="btn btn-danger btn-icon-sm"
                  onClick={() => removeItem(idx)}
                  disabled={items.length === 1}
                  title="Hapus item"
                  style={{ marginTop: 22 }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Batal</button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Menyimpan...' : isEdit ? '💾 Simpan Perubahan' : '📝 Buat Order'}
          </button>
        </div>
      </form>
    </div>
  );
}
