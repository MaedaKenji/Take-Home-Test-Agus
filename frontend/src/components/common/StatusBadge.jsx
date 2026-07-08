import Chip from '@mui/material/Chip';

const STATUS_MAP = {
  pending: { label: 'Menunggu', color: 'warning' },
  processing: { label: 'Sedang Diproses', color: 'info' },
  completed: { label: 'Selesai', color: 'success' },
  cancelled: { label: 'Dibatalkan', color: 'default' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_MAP[status] || { label: status, color: 'default' };

  const getSoftStyles = () => {
    switch (config.color) {
      case 'warning':
        return { bgcolor: 'rgba(245, 158, 11, 0.12)', color: 'warning.main', border: '1px solid rgba(245, 158, 11, 0.25)' };
      case 'info':
        return { bgcolor: 'rgba(59, 130, 246, 0.12)', color: 'info.main', border: '1px solid rgba(59, 130, 246, 0.25)' };
      case 'success':
        return { bgcolor: 'rgba(34, 197, 94, 0.12)', color: 'success.main', border: '1px solid rgba(34, 197, 94, 0.25)' };
      default:
        return { bgcolor: 'action.selected', color: 'text.secondary', border: '1px solid rgba(0, 0, 0, 0.08)' };
    }
  };

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        fontWeight: 700,
        fontSize: '0.75rem',
        borderRadius: '6px',
        ...getSoftStyles()
      }}
    />
  );
}
