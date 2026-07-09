import { useEffect, useState, useCallback } from 'react';
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
import TablePagination from '@mui/material/TablePagination';
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
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

// Material Icons
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { getMedicines, deleteMedicine, createMedicine, updateMedicine } from '../services/medicineService';
import { getCategories, createCategory, deleteCategory } from '../services/categoryService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

const EMPTY_FORM = { code: '', name: '', unit: '', unitValue: '', stock: '', minStock: 10, category: '' };
const UNITS = ['Tablet', 'Kapsul', 'ml', 'mg', 'cc', 'Botol', 'Ampul', 'Vial', 'Inhaler', 'Sachet', 'Strip'];
const LIQUID_UNITS = ['ml', 'mg', 'cc'];
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUnit, setFilterUnit] = useState('');
  const [page, setPage] = useState(0); // MUI is 0-indexed
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);

  // Category state
  const [categories, setCategories] = useState([]);
  const [addCatOpen, setAddCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [addCatLoading, setAddCatLoading] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data.data.map(c => c.name));
    } catch {
      setCategories([]);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
      };
      if (search) params.search = search;
      if (filterCategory) params.category = filterCategory;
      if (filterStatus) params.status = filterStatus;
      if (filterUnit) params.unit = filterUnit;
      const res = await getMedicines(params);
      setMedicines(res.data.data);
      setTotal(res.data.meta?.total || 0);
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory, filterStatus, filterUnit, page, rowsPerPage]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadCategories(); }, []);

  // Reset page when filters change
  useEffect(() => { setPage(0); }, [search, filterCategory, filterStatus, filterUnit]);

  const openCreate = () => { setForm(EMPTY_FORM); setEditTarget(null); setModalOpen(true); };
  const openEdit = (med) => {
    setForm({
      code: med.code, name: med.name, unit: med.unit,
      unitValue: med.unitValue ? String(med.unitValue) : '',
      stock: med.stock, minStock: med.minStock, category: med.category || '',
    });
    setEditTarget(med);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        ...form,
        unitValue: form.unitValue ? parseFloat(form.unitValue) : null,
      };
      if (editTarget) {
        await updateMedicine(editTarget.id, payload);
        toast.success('Obat berhasil diupdate');
      } else {
        await createMedicine(payload);
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

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setAddCatLoading(true);
    try {
      await createCategory(newCatName.trim());
      toast.success(`Kategori "${newCatName.trim()}" ditambahkan`);
      setForm(f => ({ ...f, category: newCatName.trim() }));
      setNewCatName('');
      loadCategories();
    } catch {
      // handled by interceptor
    } finally {
      setAddCatLoading(false);
    }
  };

  const handleDeleteCategory = async (catName) => {
    try {
      await deleteCategory(catName);
      toast.success(`Kategori "${catName}" berhasil dihapus`);
      if (form.category === catName) {
        setForm(f => ({ ...f, category: '' }));
      }
      loadCategories();
    } catch {
      // error handled by interceptor
    }
  };

  const getStockStatus = (med) => {
    if (med.stock === 0) return { label: 'Habis', color: 'error' };
    if (med.stock <= med.minStock) return { label: 'Rendah', color: 'warning' };
    return { label: 'Tersedia', color: 'success' };
  };

  const isLiquid = (unit) => LIQUID_UNITS.includes(unit?.toLowerCase());

  return (
    <Box className="animate-fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h1" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
            Manajemen Obat
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {total} obat ditemukan
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Tambah Obat
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 2 }}>
          {/* Filters */}
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
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Kategori</InputLabel>
              <Select value={filterCategory} label="Kategori" onChange={e => setFilterCategory(e.target.value)}>
                <MenuItem value="">Semua Kategori</MenuItem>
                {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Satuan</InputLabel>
              <Select value={filterUnit} label="Satuan" onChange={e => setFilterUnit(e.target.value)}>
                <MenuItem value="">Semua Satuan</MenuItem>
                {UNITS.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select value={filterStatus} label="Status" onChange={e => setFilterStatus(e.target.value)}>
                <MenuItem value="">Semua Status</MenuItem>
                <MenuItem value="Tersedia">Tersedia</MenuItem>
                <MenuItem value="Rendah">Stok Rendah</MenuItem>
                <MenuItem value="Habis">Habis</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {loading ? <LoadingSpinner /> : (
            <>
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
                            <Box component="code" sx={{
                              fontSize: 12, bgcolor: 'action.selected', color: 'text.secondary',
                              px: '6px', py: '2px', borderRadius: 1, fontFamily: 'monospace',
                            }}>
                              {med.code}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{med.name}</TableCell>
                          <TableCell sx={{ color: 'text.secondary' }}>{med.category || '-'}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {med.unit}
                              {med.unitValue && (
                                <Tooltip title={`Volume: ${med.unitValue} ${med.unit} per unit`}>
                                  <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                                    ({med.unitValue}{med.unit})
                                  </Typography>
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: med.stock === 0 ? 'error.main' : med.stock <= med.minStock ? 'warning.main' : 'success.main' }}>
                            {med.stock}
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary' }}>{med.minStock}</TableCell>
                          <TableCell>
                            <Chip label={status.label} color={status.color} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <IconButton size="small" onClick={() => openEdit(med)} title="Edit"><EditIcon fontSize="small" /></IconButton>
                              <IconButton size="small" color="error" onClick={() => setDeleteTarget(med)} title="Hapus"><DeleteIcon fontSize="small" /></IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                labelRowsPerPage="Baris per halaman:"
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} dari ${count}`}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal Form Dialog */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editTarget ? 'Edit Obat' : 'Tambah Obat Baru'}
          <IconButton onClick={() => setModalOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth label="Kode Obat" size="small"
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                  placeholder="Contoh: MED-001" required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth label="Nama Obat" size="small"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nama lengkap obat" required
                />
              </Grid>

              {/* Satuan — full width dropdown with proper sizing */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Satuan</InputLabel>
                  <Select
                    value={form.unit}
                    label="Satuan"
                    onChange={e => setForm(f => ({ ...f, unit: e.target.value, unitValue: '' }))}
                    MenuProps={{
                      PaperProps: {
                        sx: { maxHeight: 280 },
                      },
                    }}
                  >
                    <MenuItem value="">Pilih satuan</MenuItem>
                    {UNITS.map(u => (
                      <MenuItem key={u} value={u}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {u}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Custom volume for liquid */}
              {isLiquid(form.unit) && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth label={`Volume per unit (${form.unit})`} size="small"
                    type="number"
                    value={form.unitValue}
                    onChange={e => setForm(f => ({ ...f, unitValue: e.target.value }))}
                    placeholder={`Contoh: 100 (artinya 1 botol = 100${form.unit})`}
                    inputProps={{ step: '0.01', min: 0 }}
                    helperText={`Volume ${form.unit} per unit (opsional)`}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.disabled' }} /></InputAdornment>
                    }}
                  />
                </Grid>
              )}

              {/* Kategori — dengan tombol tambah kategori baru */}
              <Grid size={12}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <FormControl fullWidth size="small" sx={{ flexGrow: 1 }}>
                    <InputLabel>Kategori</InputLabel>
                    <Select
                      value={form.category}
                      label="Kategori"
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      MenuProps={{
                        PaperProps: {
                          sx: { maxHeight: 300 },
                        },
                      }}
                    >
                      <MenuItem value="">Pilih kategori</MenuItem>
                      <Divider />
                      {categories.map(c => (
                        <MenuItem key={c} value={c}>{c}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Tooltip title="Tambah kategori baru">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => setAddCatOpen(true)}
                      sx={{ mt: 0.5, border: 1, borderColor: 'divider', borderRadius: 1 }}
                    >
                      <AddCircleOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth type="number" label="Stok" size="small"
                  value={form.stock}
                  onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                  inputProps={{ min: 0 }} required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth type="number" label="Stok Minimum" size="small"
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

      {/* Manajemen Kategori Dialog */}
      <Dialog open={addCatOpen} onClose={() => setAddCatOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Manajemen Kategori
          <IconButton size="small" onClick={() => setAddCatOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          {/* Form Tambah */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3, alignItems: 'center' }}>
            <TextField
              fullWidth
              label="Nama Kategori Baru"
              size="small"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              placeholder="Contoh: Hormonal"
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
            />
            <Button
              variant="contained"
              onClick={handleAddCategory}
              disabled={addCatLoading || !newCatName.trim()}
              startIcon={addCatLoading ? <CircularProgress size={14} /> : <AddIcon />}
              sx={{ flexShrink: 0 }}
            >
              {addCatLoading ? '...' : 'Tambah'}
            </Button>
          </Box>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>
            Daftar Kategori Saat Ini ({categories.length})
          </Typography>
          <Divider />

          {/* List Kategori dengan scrollable */}
          <List dense sx={{ maxHeight: 240, overflowY: 'auto', mt: 1 }}>
            {categories.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                Belum ada kategori
              </Typography>
            ) : (
              categories.map((c) => (
                <ListItem
                  key={c}
                  secondaryAction={
                    <Tooltip title={`Hapus kategori "${c}"`}>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        size="small"
                        color="error"
                        onClick={() => handleDeleteCategory(c)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  }
                  sx={{
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'action.hover' },
                    mb: 0.5,
                  }}
                >
                  <ListItemText
                    primary={c}
                    primaryTypographyProps={{ style: { fontSize: '0.875rem', fontWeight: 500 } }}
                  />
                </ListItem>
              ))
            )}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAddCatOpen(false)} variant="outlined">Selesai</Button>
        </DialogActions>
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
