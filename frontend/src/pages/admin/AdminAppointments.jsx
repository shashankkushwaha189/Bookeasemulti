import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { appointmentsAPI } from '../../api';
import {
  CalendarDaysIcon,
  CheckBadgeIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    appointmentsAPI.getBusiness().then(r => setAppointments(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const displayed = appointments.filter(a => {
    if (filter === 'today')     return a.appointment_date === today;
    if (filter === 'booked')    return a.status === 'BOOKED';
    if (filter === 'completed') return a.status === 'COMPLETED';
    if (filter === 'cancelled') return a.status === 'CANCELLED';
    return true;
  });

  return (
    <Layout>
      <div className="mb-6"><h1 className="page-title">Appointments</h1><p className="page-subtitle">All appointments at your business</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard label="Total"     value={appointments.length}                                           icon={<CalendarDaysIcon className="w-7 h-7" />} color="purple" />
        <StatCard label="Booked"    value={appointments.filter(a => a.status === 'BOOKED').length}    icon={<ClockIcon className="w-7 h-7" />} color="blue" />
        <StatCard label="Completed" value={appointments.filter(a => a.status === 'COMPLETED').length} icon={<CheckBadgeIcon className="w-7 h-7" />} color="emerald" />
        <StatCard label="Cancelled" value={appointments.filter(a => a.status === 'CANCELLED').length} icon={<XCircleIcon className="w-7 h-7" />} color="pink" />
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['all','today','booked','completed','cancelled'].map(f => (
          <button 
            key={f} 
            className={`capitalize py-2 px-6 rounded-xl text-sm font-bold whitespace-nowrap transition-all shadow-sm ${filter === f ? 'bg-slate-900 text-white shadow-slate-900/20' : 'bg-white text-slate-600 border border-slate-200/60 hover:bg-slate-50'}`} 
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? <div className="text-slate-400 text-sm">Loading…</div> : (
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Customer</th><th>Phone</th><th>Service</th><th>Staff</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-slate-400 py-8">No appointments found.</td></tr>
              ) : displayed.map(a => (
                <tr key={a.id}>
                  <td className="font-medium">{a.customer?.name || '—'}</td>
                  <td className="text-slate-500">{a.customer?.phone || '—'}</td>
                  <td>{a.service?.name || '—'}</td>
                  <td>{a.staff?.name || '—'}</td>
                  <td>{a.appointment_date}</td>
                  <td>{a.appointment_time?.slice(0,5)}</td>
                  <td><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};
export default AdminAppointments;
