import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Pagination from '@mui/material/Pagination';
import Link from '@mui/material/Link';
import { useSearchParams } from 'react-router-dom';

// Material Icons
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import ClearIcon from '@mui/icons-material/Clear';

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

  const handlePageChange = (event, value) => {
    const p = new URLSearchParams(searchParams);
    p.set('page', value);
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
    <Box className="animate-fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h1" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
            Order Obat
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {meta.total} order ditemukan
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to="/orders/new"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          Buat Order
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl size="small" sx={{ width: 180 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={e => setParam('status', e.target.value)}
              >
                {STATUSES.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </Select>
            </FormControl>
            
            <TextField
              type="date"
              size="small"
              value={date}
              onChange={e => setParam('date', e.target.value)}
              sx={{ width: 180 }}
            />

            {(status || date) && (
              <Button
                variant="text"
                size="small"
                startIcon={<ClearIcon />}
                onClick={() => setSearchParams({})}
                color="inherit"
              >
                Reset Filter
              </Button>
            )}
          </Box>

          {loading ? <LoadingSpinner /> : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>No. Order</TableCell>
                      <TableCell>Poliklinik</TableCell>
                      <TableCell>Tanggal Order</TableCell>
                      <TableCell>Jumlah Item</TableCell>
                      <TableCell>Dipesan Oleh</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                            Tidak ada order ditemukan
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : orders.map(order => (
                      <TableRow key={order.id} hover>
                        <TableCell sx={{ fontWeight: 700 }}>
                          <Link component={RouterLink} to={`/orders/${order.id}`} underline="hover">
                            {order.orderNumber}
                          </Link>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{order.polyclinic}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>
                          {new Date(order.orderDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {order.items?.length ?? 0} item
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{order.requestedBy || '-'}</TableCell>
                        <TableCell><StatusBadge status={order.status} /></TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton size="small" component={RouterLink} to={`/orders/${order.id}`} title="Detail">
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            {order.status === 'pending' && (
                              <IconButton size="small" component={RouterLink} to={`/orders/${order.id}/edit`} title="Edit">
                                <EditIcon fontSize="small" />
                              </IconButton>
                            )}
                            {order.status === 'pending' && (
                              <IconButton size="small" color="error" onClick={() => setDeleteTarget(order)} title="Hapus">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                            {(order.status === 'pending' || order.status === 'processing') && (
                              <IconButton size="small" color="warning" onClick={() => handleCancel(order)} title="Batalkan">
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={meta.totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    shape="rounded"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Order"
        message={`Yakin ingin menghapus order "${deleteTarget?.orderNumber}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </Box>
  );
}
