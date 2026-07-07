const STATUS_MAP = {
  pending: { label: 'Pending', className: 'badge-pending' },
  processing: { label: 'Diproses', className: 'badge-processing' },
  completed: { label: 'Selesai', className: 'badge-completed' },
  cancelled: { label: 'Dibatalkan', className: 'badge-cancelled' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_MAP[status] || { label: status, className: '' };
  return <span className={`badge ${config.className}`}>{config.label}</span>;
}
