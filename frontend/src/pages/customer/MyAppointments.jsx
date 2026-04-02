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
      <div className="relative mb-8 xs:mb-6 w-full max-w-full px-4 xs:px-2 pt-6">
        <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-indigo-400/10 to-transparent blur-3xl pointer-events-none -z-10"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CalendarDaysIcon className="w-6 h-6 text-primary-500" />
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Appointments</h1>
            </div>
            <p className="text-slate-500 font-medium tracking-wide">All your bookings across premium businesses</p>
          </div>
          <button 
            className="group flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-primary-600 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-slate-900/10 hover:shadow-primary-600/30" 
            onClick={() => navigate('/businesses')}
          >
            <PlusIcon className="w-4 h-4" /> Book New
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-4 xs:px-2 mb-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white max-w-full overflow-hidden shadow-xl shadow-slate-200/30 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 shadow-inner">
            <ClipboardDocumentListIcon className="w-7 h-7" />
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{appointments.length}</p>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mt-0.5">Total</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white max-w-full overflow-hidden shadow-xl shadow-primary-500/10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 shadow-inner">
            <ClockIcon className="w-7 h-7" />
          </div>
          <div>
            <p className="text-3xl font-extrabold text-primary-600 tracking-tight">{appointments.filter(a => a.appointment_date >= today && a.status === 'BOOKED').length}</p>
            <p className="text-sm font-semibold text-primary-600/70 uppercase tracking-widest mt-0.5">Upcoming</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white max-w-full overflow-hidden shadow-xl shadow-emerald-500/10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
            <CheckBadgeIcon className="w-7 h-7" />
          </div>
          <div>
            <p className="text-3xl font-extrabold text-emerald-600 tracking-tight">{appointments.filter(a => a.status === 'COMPLETED').length}</p>
            <p className="text-sm font-semibold text-emerald-600/70 uppercase tracking-widest mt-0.5">Completed</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-nowrap overflow-x-auto w-full px-4 xs:px-2 pb-2 scrollbar-hide">
        {['all','upcoming','history'].map(f => (
          <button 
            key={f} 
            className={`capitalize py-2 px-6 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shadow-sm ${filter === f ? 'bg-slate-900 text-white shadow-slate-900/20' : 'bg-white text-slate-600 border border-slate-200/60 hover:bg-slate-50'}`} 
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? <div className="text-slate-400 text-sm font-medium text-center py-12 flex justify-center animate-pulse">Fetching your schedule...</div> : (
        <div className="px-4 xs:px-2 pb-12 w-full max-w-full">
          {displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white/40 backdrop-blur-md rounded-3xl border border-white shadow-xl shadow-slate-200/20 w-full max-w-full overflow-hidden">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-5 rotate-3 shadow-inner">
                <CalendarDaysIcon className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No appointments yet</h3>
              <p className="text-slate-500 font-medium mb-6 max-w-md">You don't have any matching schedules right now. Browse top-rated businesses to book your next session.</p>
              <button 
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-primary-600/30" 
                onClick={() => navigate('/businesses')}
              >
                Book Your First Appointment <PlusIcon className="w-4 h-4 font-bold" />
              </button>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-xl shadow-slate-200/30 w-full max-w-full overflow-hidden">
              <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/60 text-[11px] font-bold text-slate-400 text-left uppercase tracking-widest">
                      <th className="py-4 px-6 font-semibold whitespace-nowrap">Business</th>
                      <th className="py-4 px-6 font-semibold whitespace-nowrap">Category</th>
                      <th className="py-4 px-6 font-semibold whitespace-nowrap">Service</th>
                      <th className="py-4 px-6 font-semibold whitespace-nowrap">Staff</th>
                      <th className="py-4 px-6 font-semibold whitespace-nowrap">Date & Time</th>
                      <th className="py-4 px-6 font-semibold whitespace-nowrap">Status</th>
                      <th className="py-4 px-6 font-semibold whitespace-nowrap text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayed.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 flex-shrink-0 shadow-inner">
                              <BuildingStorefrontIcon className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-slate-800 group-hover:text-primary-600 transition-colors">{a.business?.name || '—'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200/50">{a.business?.category || '—'}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-slate-700">{a.service?.name || '—'}</span>
                          <div className="text-xs font-bold text-primary-600 mt-0.5">{a.business?.currency || '₹'}{parseFloat(a.service?.price || 0).toFixed(2)}</div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-800 line-clamp-1">{a.staff?.name || '—'}</p>
                          <p className="text-xs font-medium text-slate-400 line-clamp-1">{a.staff?.specialization || ''}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-semibold text-slate-700">{a.appointment_date}</p>
                          <p className="text-xs font-medium text-slate-400 flex items-center gap-1 mt-0.5"><ClockIcon className="w-3 h-3"/> {a.appointment_time?.slice(0,5)}</p>
                        </td>
                        <td className="py-4 px-6"><StatusBadge status={a.status} /></td>
                        <td className="py-4 px-6 text-right">
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
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};
export default MyAppointments;
