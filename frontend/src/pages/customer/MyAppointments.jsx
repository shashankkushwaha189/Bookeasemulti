import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import { appointmentsAPI } from '../../api';
import {
  CalendarDaysIcon,
  PlusIcon,
  ClipboardDocumentListIcon,
  CheckBadgeIcon,
  ClockIcon,
  BuildingStorefrontIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

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
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDaysIcon className="w-6 h-6 text-primary-500 flex-shrink-0" />
            <h1 className="page-title">My Appointments</h1>
          </div>
          <p className="page-subtitle">All your bookings across premium businesses</p>
        </div>
        <button
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-primary-600 text-white font-semibold rounded-xl text-sm transition-all shadow-md self-start sm:self-auto"
          onClick={() => navigate('/businesses')}
        >
          <PlusIcon className="w-4 h-4" /> Book New
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white shadow-xl shadow-slate-200/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shadow-inner flex-shrink-0">
            <ClipboardDocumentListIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-extrabold text-slate-900">{appointments.length}</p>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest truncate">Total</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white shadow-xl shadow-primary-500/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 shadow-inner flex-shrink-0">
            <ClockIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-extrabold text-primary-600">{appointments.filter(a => a.appointment_date >= today && a.status === 'BOOKED').length}</p>
            <p className="text-[10px] font-semibold text-primary-600/70 uppercase tracking-widest truncate">Upcoming</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white shadow-xl shadow-emerald-500/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner flex-shrink-0">
            <CheckBadgeIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-extrabold text-emerald-600">{appointments.filter(a => a.status === 'COMPLETED').length}</p>
            <p className="text-[10px] font-semibold text-emerald-600/70 uppercase tracking-widest truncate">Done</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        {['all', 'upcoming', 'history'].map(f => (
          <button
            key={f}
            className={`capitalize py-2 px-5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shadow-sm flex-shrink-0 ${filter === f ? 'bg-slate-900 text-white shadow-slate-900/20' : 'bg-white text-slate-600 border border-slate-200/60 hover:bg-slate-50'}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm font-medium text-center py-12 animate-pulse">Fetching your schedule...</div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white/40 backdrop-blur-md rounded-3xl border border-white shadow-xl shadow-slate-200/20">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-5 shadow-inner">
            <CalendarDaysIcon className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No appointments yet</h3>
          <p className="text-slate-500 font-medium mb-6 max-w-sm">Browse top-rated businesses to book your next session.</p>
          <button
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-primary-600/30"
            onClick={() => navigate('/businesses')}
          >
            Book Your First Appointment <PlusIcon className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Category</th>
                <th>Service</th>
                <th>Staff</th>
                <th>Date &amp; Time</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(a => (
                <tr key={a.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 flex-shrink-0 shadow-inner">
                        <BuildingStorefrontIcon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-800 whitespace-nowrap">{a.business?.name || '—'}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200/50 whitespace-nowrap">
                      {a.business?.category || '—'}
                    </span>
                  </td>
                  <td>
                    <span className="font-semibold text-slate-700 whitespace-nowrap">{a.service?.name || '—'}</span>
                    <div className="text-xs font-bold text-primary-600 mt-0.5">{a.business?.currency || '₹'}{parseFloat(a.service?.price || 0).toFixed(2)}</div>
                  </td>
                  <td>
                    <p className="font-bold text-slate-800 whitespace-nowrap">{a.staff?.name || '—'}</p>
                    <p className="text-xs text-slate-400 whitespace-nowrap">{a.staff?.specialization || ''}</p>
                  </td>
                  <td>
                    <p className="font-semibold text-slate-700 whitespace-nowrap">{a.appointment_date}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <ClockIcon className="w-3 h-3" /> {a.appointment_time?.slice(0, 5)}
                    </p>
                  </td>
                  <td><StatusBadge status={a.status} /></td>
                  <td className="text-right">
                    {a.status === 'BOOKED' && a.appointment_date >= today && (
                      <button
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg text-xs transition-colors border border-red-100/50"
                        onClick={() => handleCancel(a.id)}
                      >
                        <XCircleIcon className="w-4 h-4" /> Cancel
                      </button>
                    )}
                  </td>
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
