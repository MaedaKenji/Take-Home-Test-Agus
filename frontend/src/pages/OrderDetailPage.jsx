import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
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
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';

// Material Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import FactCheckIcon from '@mui/icons-material/FactCheck';

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
  processing: { label: 'Proses Order', className: 'btn-primary', icon: <AutorenewIcon />, color: 'primary' },
  completed: { label: 'Selesaikan Order', className: 'btn-success', icon: <CheckCircleIcon />, color: 'success' },
  cancelled: { label: 'Batalkan Order', className: 'btn-danger', icon: <CancelIcon />, color: 'error' },
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
    <Box className="animate-fade-in" sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
            <Typography variant="h1" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {order.orderNumber}
            </Typography>
            <StatusBadge status={order.status} />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Dibuat {new Date(order.createdAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
            Kembali
          </Button>
          {order.status === 'pending' && (
            <Button
              component={RouterLink}
              to={`/orders/${id}/edit`}
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
            >
              Edit Order
            </Button>
          )}
        </Box>
      </Box>

      {/* Info Order */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h3" sx={{ fontSize: '1rem', fontWeight: 700, mb: 2 }}>
            Informasi Order
          </Typography>
          <Grid container spacing={2}>
            {[
              { label: 'Nomor Order', value: order.orderNumber },
              { label: 'Poliklinik', value: order.polyclinic },
              { label: 'Tanggal Order', value: new Date(order.orderDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
              { label: 'Dipesan Oleh', value: order.requestedBy || '-' },
            ].map(info => (
              <Grid item xs={12} sm={6} md={3} key={info.label}>
                <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, border: 1, borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>
                    {info.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {info.value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1, border: 1, borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>
              Catatan
            </Typography>
            <Typography variant="body2" sx={{ color: order.notes ? 'text.primary' : 'text.disabled' }}>
              {order.notes || '-'}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Detail Obat */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h3" sx={{ fontSize: '1rem', fontWeight: 700 }}>
              Detail Obat ({order.items?.length} item)
            </Typography>
            {order.status === 'processing' && !approvalMode && (
              <Button size="small" variant="contained" startIcon={<FactCheckIcon />} onClick={() => setApprovalMode(true)}>
                Isi Jumlah Disetujui
              </Button>
            )}
            {approvalMode && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="outlined" onClick={() => setApprovalMode(false)}>
                  Batal
                </Button>
                <Button size="small" variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSaveApproval} disabled={approvalLoading}>
                  {approvalLoading ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </Box>
            )}
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Nama Obat</TableCell>
                  <TableCell>Satuan</TableCell>
                  <TableCell>Diminta</TableCell>
                  <TableCell>Disetujui</TableCell>
                  <TableCell>Stok Saat Ini</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.items?.map((item, idx) => (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ color: 'text.secondary' }}>{idx + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{item.medicine?.name}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{item.medicine?.unit}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{item.quantityRequested}</TableCell>
                    <TableCell>
                      {approvalMode ? (
                        <TextField
                          type="number"
                          size="small"
                          sx={{ width: 90 }}
                          value={approvedQtys[item.id] ?? item.quantityRequested}
                          inputProps={{ min: 0, max: item.quantityRequested }}
                          onChange={e => setApprovedQtys(prev => ({ ...prev, [item.id]: e.target.value }))}
                        />
                      ) : (
                        <Typography sx={{ fontWeight: 600, color: item.quantityApproved !== null ? 'success.main' : 'text.disabled' }}>
                          {item.quantityApproved ?? '-'}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ color: (item.medicine?.stock ?? 0) <= 0 ? 'error.main' : 'text.secondary' }}>
                        {item.medicine?.stock ?? 0}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Status Actions */}
      {transitions.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h3" sx={{ fontSize: '1rem', fontWeight: 700, mb: 2 }}>
              Ubah Status Order
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {nonCancelTransitions.map(t => (
                <Button
                  key={t}
                  variant="contained"
                  color={STATUS_ACTIONS[t]?.color || 'primary'}
                  startIcon={STATUS_ACTIONS[t]?.icon}
                  onClick={() => setStatusDialog(t)}
                >
                  {STATUS_ACTIONS[t]?.label || t}
                </Button>
              ))}
              {canCancel && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={STATUS_ACTIONS.cancelled.icon}
                  onClick={() => setStatusDialog('cancelled')}
                >
                  {STATUS_ACTIONS.cancelled.label}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
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
    </Box>
  );
}
