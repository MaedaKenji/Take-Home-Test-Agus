import { useEffect, useState } from 'react';
import { getMedicines, deleteMedicine, createMedicine, updateMedicine } from '../services/medicineService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

const EMPTY_FORM = { code: '', name: '', unit: '', stock: '', minStock: 10, category: '' };
const UNITS = ['Tablet', 'Kapsul', 'ml', 'mg', 'Botol', 'Ampul', 'Vial', 'Inhaler', 'Sachet', 'Strip'];
const CATEGORIES = ['Analgesik', 'Antibiotik', 'Antasida', 'Antidiabetes', 'Antihipertensi', 'Antilipid', 'Antihistamin', 'Kortikosteroid', 'Diuretik', 'Psikotropika', 'Bronkodilator', 'Cairan Infus', 'Vitamin', 'Lainnya'];

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterCategory) params.category = filterCategory;
      const res = await getMedicines(params);
      setMedicines(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, filterCategory]);

  const openCreate = () => { setForm(EMPTY_FORM); setEditTarget(null); setModalOpen(true); };
  const openEdit = (med) => { setForm({ code: med.code, name: med.name, unit: med.unit, stock: med.stock, minStock: med.minStock, category: med.category || '' }); setEditTarget(med); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editTarget) {
        await updateMedicine(editTarget.id, form);
        toast.success('Obat berhasil diupdate');
      } else {
        await createMedicine(form);
        toast.success('Obat berhasil ditambahkan');
      }
      setModalOpen(false);
      load();
    } catch {
      // error toast handled by interceptor
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteMedicine(deleteTarget.id);
      toast.success('Obat berhasil dihapus');
      setDeleteTarget(null);
      load();
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStockStatus = (med) => {
    if (med.stock === 0) return { label: 'Habis', badge: 'badge-danger' };
    if (med.stock <= med.minStock) return { label: 'Rendah', badge: 'badge-warning' };
    return { label: 'Tersedia', badge: 'badge-success' };
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Manajemen Obat</h1>
          <p>{medicines.length} obat ditemukan</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Tambah Obat</button>
      </div>

      <div className="card">
        <div className="filter-bar">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="form-control"
              placeholder="Cari nama obat..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="form-control" style={{ width: 180 }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">Semua Kategori</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Nama Obat</th>
                  <th>Kategori</th>
                  <th>Satuan</th>
                  <th>Stok</th>
                  <th>Min. Stok</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {medicines.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40 }}>
                    <div className="empty-state-icon">💊</div>
                    <p style={{ color: 'var(--color-text-muted)' }}>Tidak ada data obat</p>
                  </td></tr>
                ) : medicines.map(med => {
                  const status = getStockStatus(med);
                  return (
                    <tr key={med.id}>
                      <td data-label="Kode"><code style={{ fontSize: 12, background: 'var(--color-surface-2)', padding: '2px 6px', borderRadius: 4 }}>{med.code}</code></td>
                      <td data-label="Nama" style={{ fontWeight: 600 }}>{med.name}</td>
                      <td data-label="Kategori" className="text-muted">{med.category || '-'}</td>
                      <td data-label="Satuan">{med.unit}</td>
                      <td data-label="Stok" style={{ fontWeight: 700, color: med.stock === 0 ? 'var(--color-danger)' : med.stock <= med.minStock ? 'var(--color-warning)' : 'var(--color-success)' }}>
                        {med.stock}
                      </td>
                      <td data-label="Min Stok" className="text-muted">{med.minStock}</td>
                      <td data-label="Status"><span className={`badge ${status.badge}`}>{status.label}</span></td>
                      <td data-label="Aksi">
                        <div className="flex gap-2">
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(med)}>✏️ Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(med)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editTarget ? 'Edit Obat' : 'Tambah Obat Baru'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label required">Kode Obat</label>
                    <input className="form-control" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="Contoh: MED-001" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Nama Obat</label>
                    <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nama lengkap obat" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Satuan</label>
                    <select className="form-control" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} required>
                      <option value="">Pilih satuan</option>
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kategori</label>
                    <select className="form-control" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      <option value="">Pilih kategori</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Stok</label>
                    <input type="number" className="form-control" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} min="0" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stok Minimum</label>
                    <input type="number" className="form-control" value={form.minStock} onChange={e => setForm(f => ({ ...f, minStock: e.target.value }))} min="0" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Menyimpan...' : editTarget ? 'Simpan Perubahan' : 'Tambah Obat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Obat"
        message={`Yakin ingin menghapus obat "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
