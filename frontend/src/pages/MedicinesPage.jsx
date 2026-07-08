import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';

// Material Icons
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

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
  const [filterStatus, setFilterStatus] = useState('');
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
      if (filterStatus) params.status = filterStatus;
      const res = await getMedicines(params);
      setMedicines(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, filterCategory, filterStatus]);

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
    if (med.stock === 0) return { label: 'Habis', color: 'error' };
    if (med.stock <= med.minStock) return { label: 'Rendah', color: 'warning' };
    return { label: 'Tersedia', color: 'success' };
  };

  return (
    <Box className="animate-fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h1" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
            Manajemen Obat
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {medicines.length} obat ditemukan
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Tambah Obat
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Cari nama obat..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              sx={{ flexGrow: 1, minWidth: 200 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon size="small" />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ width: 180 }}>
              <InputLabel>Semua Kategori</InputLabel>
              <Select
                value={filterCategory}
                label="Semua Kategori"
                onChange={e => setFilterCategory(e.target.value)}
              >
                <MenuItem value="">Semua Kategori</MenuItem>
                {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ width: 180 }}>
              <InputLabel>Semua Status</InputLabel>
              <Select
                value={filterStatus}
                label="Semua Status"
                onChange={e => setFilterStatus(e.target.value)}
              >
                <MenuItem value="">Semua Status</MenuItem>
                <MenuItem value="Tersedia">Tersedia</MenuItem>
                <MenuItem value="Rendah">Stok Rendah</MenuItem>
                <MenuItem value="Habis">Habis</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {loading ? <LoadingSpinner /> : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Kode</TableCell>
                    <TableCell>Nama Obat</TableCell>
                    <TableCell>Kategori</TableCell>
                    <TableCell>Satuan</TableCell>
                    <TableCell>Stok</TableCell>
                    <TableCell>Min. Stok</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {medicines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
                          Tidak ada data obat
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : medicines.map(med => {
                    const status = getStockStatus(med);
                    return (
                      <TableRow key={med.id} hover>
                        <TableCell>
                          <Box
                            component="code"
                            sx={{
                              fontSize: 12,
                              bgcolor: 'action.selected',
                              color: 'text.secondary',
                              px: '6px',
                              py: '2px',
                              borderRadius: 1,
                              fontFamily: 'monospace',
                            }}
                          >
                            {med.code}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{med.name}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{med.category || '-'}</TableCell>
                        <TableCell>{med.unit}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: med.stock === 0 ? 'error.main' : med.stock <= med.minStock ? 'warning.main' : 'success.main' }}>
                          {med.stock}
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{med.minStock}</TableCell>
                        <TableCell>
                          <Chip label={status.label} color={status.color} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small" onClick={() => openEdit(med)} title="Edit">
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => setDeleteTarget(med)} title="Hapus">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Modal Form Dialog */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editTarget ? 'Edit Obat' : 'Tambah Obat Baru'}
          <IconButton onClick={() => setModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Kode Obat"
                  size="small"
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                  placeholder="Contoh: MED-001"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nama Obat"
                  size="small"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nama lengkap obat"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Satuan</InputLabel>
                  <Select
                    value={form.unit}
                    label="Satuan"
                    onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  >
                    <MenuItem value="">Pilih satuan</MenuItem>
                    {UNITS.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Kategori</InputLabel>
                  <Select
                    value={form.category}
                    label="Kategori"
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    <MenuItem value="">Pilih kategori</MenuItem>
                    {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Stok"
                  size="small"
                  value={form.stock}
                  onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                  inputProps={{ min: 0 }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Stok Minimum"
                  size="small"
                  value={form.minStock}
                  onChange={e => setForm(f => ({ ...f, minStock: e.target.value }))}
                  inputProps={{ min: 0 }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setModalOpen(false)} color="inherit">Batal</Button>
            <Button type="submit" variant="contained" disabled={formLoading}>
              {formLoading ? 'Menyimpan...' : editTarget ? 'Simpan Perubahan' : 'Tambah Obat'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Obat"
        message={`Yakin ingin menghapus obat "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </Box>
  );
}
