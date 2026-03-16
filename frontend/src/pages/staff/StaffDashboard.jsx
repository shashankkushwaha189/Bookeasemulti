import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import { staffAPI, appointmentsAPI } from '../../api';
import { getCategoryIcon } from '../../config/categories';

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
        <h1 className="page-title">My Schedule</h1>
        <p className="page-subtitle">{today ? new Date(today + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card text-center"><p className="text-3xl font-bold text-primary-600">{todayPending}</p><p className="text-sm text-slate-500 mt-1">Pending Today</p></div>
        <div className="card text-center"><p className="text-3xl font-bold text-emerald-600">{appointments.filter(a => a.status === 'COMPLETED').length}</p><p className="text-sm text-slate-500 mt-1">Completed Total</p></div>
      </div>

      <div className="flex gap-2 mb-4">
        <button className={'btn text-sm py-1.5 px-4 ' + (filter === 'today' ? 'btn-primary' : 'btn-secondary')} onClick={() => setFilter('today')}>Today</button>
        <button className={'btn text-sm py-1.5 px-4 ' + (filter === 'all'   ? 'btn-primary' : 'btn-secondary')} onClick={() => setFilter('all')}>All</button>
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
