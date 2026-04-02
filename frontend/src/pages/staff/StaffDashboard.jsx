import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { staffAPI, appointmentsAPI } from '../../api';
import { getCategoryIcon } from '../../config/categories';
import {
  CalendarDaysIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

const StaffDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [today, setToday] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('today');

  useEffect(() => {
    staffAPI.getMyAppointments()
      .then(r => { setAppointments(r.data.appointments); setToday(r.data.today); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleComplete = async (id) => {
    try {
      await appointmentsAPI.update(id, { status: 'COMPLETED' });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'COMPLETED' } : a));
    } catch { alert('Failed to update.'); }
  };

  const displayed = filter === 'today' ? appointments.filter(a => a.appointment_date === today) : appointments;
  const todayPending = appointments.filter(a => a.appointment_date === today && a.status === 'BOOKED').length;

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <CalendarDaysIcon className="w-8 h-8 text-primary-500" />
          <div>
            <h1 className="page-title">My Schedule</h1>
            <p className="page-subtitle">{today ? new Date(today + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        <StatCard label="Pending Today" value={todayPending} icon={<CalendarDaysIcon className="w-7 h-7" />} color="blue" />
        <StatCard label="Completed Total" value={appointments.filter(a => a.status === 'COMPLETED').length} icon={<CheckBadgeIcon className="w-7 h-7" />} color="emerald" />
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button 
          className={`py-2 px-6 rounded-xl text-sm font-bold whitespace-nowrap transition-all shadow-sm ${filter === 'today' ? 'bg-slate-900 text-white shadow-slate-900/20' : 'bg-white text-slate-600 border border-slate-200/60 hover:bg-slate-50'}`} 
          onClick={() => setFilter('today')}
        >
          Today's Schedule
        </button>
        <button 
          className={`py-2 px-6 rounded-xl text-sm font-bold whitespace-nowrap transition-all shadow-sm ${filter === 'all' ? 'bg-slate-900 text-white shadow-slate-900/20' : 'bg-white text-slate-600 border border-slate-200/60 hover:bg-slate-50'}`} 
          onClick={() => setFilter('all')}
        >
          All Appointments
        </button>
      </div>

      {loading ? <div className="text-slate-400 text-sm">Loading…</div> : (
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Customer</th><th>Phone</th><th>Business</th><th>Service</th><th>Date</th><th>Time</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-slate-400 py-8">{filter === 'today' ? 'No appointments today.' : 'No appointments.'}</td></tr>
              ) : displayed.map(a => (
                <tr key={a.id}>
                  <td className="font-medium">{a.customer?.name || '—'}</td>
                  <td className="text-slate-500">{a.customer?.phone || '—'}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <span>{getCategoryIcon(a.business?.category)}</span>
                      <span className="text-sm">{a.business?.name || '—'}</span>
                    </div>
                  </td>
                  <td>{a.service?.name || '—'}</td>
                  <td>{a.appointment_date}</td>
                  <td>{a.appointment_time?.slice(0,5)}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>{a.status === 'BOOKED' && <button className="btn-success text-xs py-1 px-2" onClick={() => handleComplete(a.id)}>✓ Done</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};
export default StaffDashboard;
