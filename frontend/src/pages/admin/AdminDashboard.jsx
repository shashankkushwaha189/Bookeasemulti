import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { appointmentsAPI, servicesAPI, staffAPI } from '../../api';
import { useAuth } from '../../routes/AuthContext';
import { getCategoryIcon } from '../../config/categories';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([appointmentsAPI.getBusiness(), servicesAPI.getAll(), staffAPI.getAll()])
      .then(([a, s, st]) => { setAppointments(a.data); setServices(s.data); setStaff(st.data); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayCount = appointments.filter(a => a.appointment_date === today && a.status === 'BOOKED').length;
  const catIcon = getCategoryIcon(user?.businessCategory);

  if (loading) return <Layout><div className="text-slate-400 text-sm">Loading…</div></Layout>;

  return (
    <Layout>
      <div className="mb-6 xs:ml-20 xs:mt-4">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Manage your business operations</p>
      </div>
      <div className="mb-6 xs:ml-20 xs:mt-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{catIcon}</span>
          <div>
            <h1 className="page-title">{user?.businessName || 'Dashboard'}</h1>
            <p className="page-subtitle">{user?.businessCategory} · Business overview</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Appointments" value={appointments.length}                                           icon="📅" color="blue" />
        <StatCard label="Today's Bookings"   value={todayCount}                                                    icon="🕐" color="amber" />
        <StatCard label="Staff Members"      value={staff.length}                                                  icon="👤" color="purple" />
        <StatCard label="Services"           value={services.length}                                               icon="✂️" color="emerald" />
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100"><h2 className="font-semibold text-slate-800">Recent Appointments</h2></div>
        <div className="table-wrapper border-0 rounded-none">
          <table className="table">
            <thead><tr><th>Customer</th><th>Service</th><th>Staff</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
            <tbody>
              {appointments.slice(0,8).length === 0 ? (
                <tr><td colSpan={6} className="text-center text-slate-400 py-8">No appointments yet.</td></tr>
              ) : appointments.slice(0,8).map(a => (
                <tr key={a.id}>
                  <td className="font-medium">{a.customer?.name || '—'}</td>
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
      </div>
    </Layout>
  );
};
export default AdminDashboard;
