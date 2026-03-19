import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import { appointmentsAPI } from '../../api';

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
      <div className="mb-6 xs:ml-20 xs:mt-4"><h1 className="page-title">Appointments</h1><p className="page-subtitle">All appointments at your business</p></div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card text-center"><p className="text-2xl font-bold text-slate-900">{appointments.length}</p><p className="text-xs text-slate-500 mt-1">Total</p></div>
        <div className="card text-center"><p className="text-2xl font-bold text-blue-600">{appointments.filter(a => a.status === 'BOOKED').length}</p><p className="text-xs text-slate-500 mt-1">Booked</p></div>
        <div className="card text-center"><p className="text-2xl font-bold text-emerald-600">{appointments.filter(a => a.status === 'COMPLETED').length}</p><p className="text-xs text-slate-500 mt-1">Completed</p></div>
        <div className="card text-center"><p className="text-2xl font-bold text-red-600">{appointments.filter(a => a.status === 'CANCELLED').length}</p><p className="text-xs text-slate-500 mt-1">Cancelled</p></div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {['all','today','booked','completed','cancelled'].map(f => (
          <button key={f} className={'btn text-sm py-1.5 px-3 capitalize ' + (filter === f ? 'btn-primary' : 'btn-secondary')} onClick={() => setFilter(f)}>{f}</button>
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
