import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import { appointmentsAPI } from '../../api';
import { getCategoryIcon } from '../../config/categories';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    appointmentsAPI.getMy().then(r => setAppointments(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await appointmentsAPI.update(id, { status: 'CANCELLED' });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a));
    } catch (err) { alert(err.response?.data?.message || 'Failed to cancel.'); }
  };

  const today = new Date().toISOString().split('T')[0];
  const displayed = appointments.filter(a => {
    if (filter === 'upcoming') return a.appointment_date >= today && a.status === 'BOOKED';
    if (filter === 'history')  return a.appointment_date < today || a.status !== 'BOOKED';
    return true;
  });

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between flex-col xs:flex-row gap-4 xs:gap-0 xs:ml-20 xs:mt-4">
        <div><h1 className="page-title">My Appointments</h1><p className="page-subtitle">All your bookings across businesses</p></div>
        <button className="btn-primary xs:mr-4" onClick={() => navigate('/businesses')}>+ Book New</button>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-3 gap-4 mb-6">
        <div className="card text-center"><p className="text-2xl xs:text-xl font-bold text-slate-900">{appointments.length}</p><p className="text-xs text-slate-500 mt-1">Total</p></div>
        <div className="card text-center"><p className="text-2xl xs:text-xl font-bold text-primary-600">{appointments.filter(a => a.appointment_date >= today && a.status === 'BOOKED').length}</p><p className="text-xs text-slate-500 mt-1">Upcoming</p></div>
        <div className="card text-center"><p className="text-2xl xs:text-xl font-bold text-emerald-600">{appointments.filter(a => a.status === 'COMPLETED').length}</p><p className="text-xs text-slate-500 mt-1">Completed</p></div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {['all','upcoming','history'].map(f => (
          <button key={f} className={'btn text-sm py-1.5 px-4 xs:px-3 xs:text-xs capitalize ' + (filter === f ? 'btn-primary' : 'btn-secondary')} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {loading ? <div className="text-slate-400 text-sm">Loading…</div> : (
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Business</th><th>Category</th><th>Service</th><th>Staff</th><th>Date</th><th>Time</th><th>Price</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr><td colSpan={9} className="text-center text-slate-400 py-8">No appointments found. <button className="text-primary-600 hover:underline" onClick={() => navigate('/businesses')}>Book one →</button></td></tr>
              ) : displayed.map(a => (
                <tr key={a.id}>
                  <td className="font-medium">
                    <div className="flex items-center gap-2">
                      <span>{getCategoryIcon(a.business?.category)}</span>
                      <span>{a.business?.name || '—'}</span>
                    </div>
                  </td>
                  <td><span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{a.business?.category || '—'}</span></td>
                  <td>{a.service?.name || '—'}</td>
                  <td><p className="font-medium">{a.staff?.name || '—'}</p><p className="text-xs text-slate-400">{a.staff?.specialization || ''}</p></td>
                  <td>{a.appointment_date}</td>
                  <td>{a.appointment_time?.slice(0,5)}</td>
                  <td>{a.business?.currency || '₹'}{parseFloat(a.service?.price || 0).toFixed(2)}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>{a.status === 'BOOKED' && a.appointment_date >= today && <button className="btn-danger text-xs py-1 px-2" onClick={() => handleCancel(a.id)}>Cancel</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};
export default MyAppointments;
