const StatusBadge = ({ status }) => {
  const map = { BOOKED: 'badge-booked', COMPLETED: 'badge-completed', CANCELLED: 'badge-cancelled' };
  return <span className={map[status] || 'badge bg-slate-100 text-slate-600'}>{status}</span>;
};
export default StatusBadge;
