import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';

// Material Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { getMedicines } from '../services/medicineService';
import { createOrder, updateOrder, getOrderById } from '../services/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const POLYCLINICS = [
  'Poli Umum', 'Poli Gigi', 'Poli Anak', 'Poli Kandungan', 'Poli Penyakit Dalam',
  'Poli Bedah', 'Poli Jantung', 'Poli Mata', 'Poli THT', 'Poli Saraf', 'Poli Kulit',
  'Poli Ortopedi', 'IGD', 'Rawat Inap Lantai 1', 'Rawat Inap Lantai 2', 'ICU',
];

const LIQUID_UNITS = ['ml', 'mg', 'cc'];

const EMPTY_ITEM = { medicineId: '', medicine: null, quantityRequested: 1, customVolume: '', notes: '' };

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
        setItems(o.items.map(i => ({
          medicineId: i.medicineId,
          medicine: i.medicine,
          quantityRequested: i.quantityRequested,
          customVolume: '',
          notes: i.notes || '',
        })));
      }).finally(() => setPageLoading(false));
    }
  }, [id]);

  const addItem = () => setItems(prev => [...prev, { ...EMPTY_ITEM }]);
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const updateItem = (idx, key, val) =>
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [key]: val } : item));

  const handleMedicineSelect = (idx, med) => {
    setItems(prev => prev.map((item, i) =>
      i === idx ? { ...item, medicineId: med ? med.id : '', medicine: med } : item
    ));
  };

  const isLiquid = (unit) => LIQUID_UNITS.includes(unit?.toLowerCase());

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
      const payload = {
        ...form,
        items: items.map(item => ({
          medicineId: item.medicineId,
          quantityRequested: item.quantityRequested,
          notes: item.notes,
          ...(item.customVolume ? { customVolume: parseFloat(item.customVolume) } : {}),
        })),
      };
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

  const getStockColor = (med) => {
    if (!med) return 'text.secondary';
    if (med.stock === 0) return 'error.main';
    if (med.stock <= med.minStock) return 'warning.main';
    return 'success.main';
  };

  if (pageLoading) return <LoadingSpinner fullPage />;

  return (
    <Box className="animate-fade-in" sx={{ maxWidth: 940, mx: 'auto', pb: 32 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h1" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {isEdit ? 'Edit Order' : 'Buat Order Baru'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {isEdit ? 'Ubah data pesanan obat' : 'Tambah pesanan obat dari poliklinik'}
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Kembali
        </Button>
      </Box>

      <form onSubmit={handleSubmit}>
        {/* Info Order */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h3" sx={{ fontSize: '1rem', fontWeight: 700, mb: 2.5 }}>
              Informasi Order
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small" required error={!!errors.polyclinic}>
                  <InputLabel id="polyclinic-select-label">Poliklinik / Unit</InputLabel>
                  <Select
                    fullWidth
                    labelId="polyclinic-select-label"
                    value={form.polyclinic}
                    label="Poliklinik / Unit"
                    onChange={e => setForm(f => ({ ...f, polyclinic: e.target.value }))}
                  >
                    <MenuItem value="">Pilih poliklinik / unit</MenuItem>
                    {POLYCLINICS.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                  </Select>
                  {errors.polyclinic && <Typography variant="caption" color="error">{errors.polyclinic}</Typography>}
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  fullWidth type="date" label="Tanggal Order" size="small"
                  value={form.orderDate}
                  onChange={e => setForm(f => ({ ...f, orderDate: e.target.value }))}
                  required error={!!errors.orderDate} helperText={errors.orderDate}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 5 }}>
                <TextField
                  fullWidth label="Dipesan Oleh" size="small"
                  value={form.requestedBy}
                  onChange={e => setForm(f => ({ ...f, requestedBy: e.target.value }))}
                  placeholder="Nama petugas poli"
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth multiline rows={3} label="Catatan"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Catatan tambahan (opsional)"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Items */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h3" sx={{ fontSize: '1rem', fontWeight: 700 }}>
                Daftar Obat yang Dipesan
              </Typography>
              <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={addItem}>
                Tambah Obat
              </Button>
            </Box>
            {errors.items && <Typography variant="body2" color="error" sx={{ mb: 2 }}>{errors.items}</Typography>}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {items.map((item, idx) => {
                const selectedMed = item.medicine;
                const liquid = isLiquid(selectedMed?.unit);
                return (
                  <Card key={idx} variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
                    <Grid container spacing={2} alignItems="flex-start">
                      {/* Medicine Autocomplete */}
                      <Grid size={{ xs: 12, sm: liquid ? 6 : 8 }}>
                        <Autocomplete
                          id={`medicine-autocomplete-${idx}`}
                          options={medicines}
                          value={selectedMed}
                          onChange={(_, newVal) => handleMedicineSelect(idx, newVal)}
                          getOptionLabel={(opt) => opt ? `${opt.name} (${opt.unit})` : ''}
                          isOptionEqualToValue={(opt, val) => opt.id === val?.id}
                          getOptionDisabled={(opt) => opt.stock === 0}
                          disablePortal
                          slotProps={{
                            popper: {
                              placement: 'bottom-start',
                              modifiers: [
                                {
                                  name: 'flip',
                                  enabled: false,
                                },
                              ],
                            },
                          }}
                          filterOptions={(opts, { inputValue }) => {
                            const q = inputValue.toLowerCase();
                            return opts.filter(o =>
                              o.name.toLowerCase().includes(q) ||
                              o.code.toLowerCase().includes(q) ||
                              (o.category || '').toLowerCase().includes(q)
                            );
                          }}
                          renderOption={(props, opt) => (
                            <Box component="li" {...props} key={opt.id}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                <MedicalServicesIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                                    {opt.name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {opt.code} · {opt.unit} · {opt.category}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                                  <Typography variant="caption" sx={{ color: getStockColor(opt), fontWeight: 700 }}>
                                    Stok: {opt.stock}
                                  </Typography>
                                  {opt.stock === 0 && (
                                    <Chip label="Habis" size="small" color="error" sx={{ height: 16, fontSize: 10 }} />
                                  )}
                                  {opt.stock > 0 && opt.stock <= opt.minStock && (
                                    <Chip label="Rendah" size="small" color="warning" sx={{ height: 16, fontSize: 10 }} />
                                  )}
                                </Box>
                              </Box>
                            </Box>
                          )}
                          renderInput={(params) => {
                            const { InputProps, ...restParams } = params;
                            return (
                              <TextField
                                {...restParams}
                                label="Cari Obat"
                                size="small"
                                required
                                error={!!errors[`item_${idx}_med`]}
                                helperText={errors[`item_${idx}_med`] || (selectedMed ? `Stok: ${selectedMed.stock} ${selectedMed.unit}` : 'Ketik nama atau kode obat')}
                                placeholder="Ketik nama, kode, atau kategori..."
                                InputProps={{
                                  ...InputProps,
                                  startAdornment: (
                                    <>
                                      {selectedMed && selectedMed.stock <= selectedMed.minStock && selectedMed.stock > 0 && (
                                        <WarningAmberIcon sx={{ color: 'warning.main', fontSize: 18, mr: 0.5 }} />
                                      )}
                                      {InputProps?.startAdornment}
                                    </>
                                  ),
                                }}
                              />
                            );
                          }}
                          noOptionsText="Obat tidak ditemukan"
                          loadingText="Memuat..."
                        />
                      </Grid>

                      {/* Custom volume for liquid medicines */}
                      {liquid && (
                        <Grid size={{ xs: 12, sm: 2 }}>
                          <TextField
                            fullWidth
                            type="number"
                            label={`Volume (${selectedMed.unit})`}
                            size="small"
                            value={item.customVolume}
                            onChange={e => updateItem(idx, 'customVolume', e.target.value)}
                            placeholder={selectedMed.unitValue ? String(selectedMed.unitValue) : '0'}
                            helperText={selectedMed.unitValue ? `Default: ${selectedMed.unitValue}${selectedMed.unit}` : 'Opsional'}
                            inputProps={{ step: '0.01', min: 0 }}
                          />
                        </Grid>
                      )}

                      {/* Quantity */}
                      <Grid size={{ xs: 10, sm: liquid ? 3 : 3 }}>
                        <TextField
                          fullWidth type="number" label={liquid ? `Jumlah (${selectedMed?.unit || 'unit'})` : 'Jumlah'} size="small"
                          value={item.quantityRequested}
                          onChange={e => updateItem(idx, 'quantityRequested', parseInt(e.target.value) || 1)}
                          inputProps={{ min: 1 }}
                          required
                          error={!!errors[`item_${idx}_qty`]}
                          helperText={errors[`item_${idx}_qty`]}
                        />
                      </Grid>

                      {/* Delete button */}
                      <Grid size={{ xs: 2, sm: 1 }} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', pt: 0.5 }}>
                        <IconButton
                          color="error"
                          onClick={() => removeItem(idx)}
                          disabled={items.length === 1}
                          title="Hapus item"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Card>
                );
              })}
            </Box>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate(-1)}>Batal</Button>
          <Button type="submit" variant="contained" size="large" startIcon={<SaveIcon />} disabled={loading}>
            {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Order'}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
