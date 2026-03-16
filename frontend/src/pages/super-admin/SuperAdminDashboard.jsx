import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import { superAdminAPI, businessAPI, appointmentsAPI } from '../../api';
import { getCategoryIcon } from '../../config/categories';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([superAdminAPI.getStats(), businessAPI.getAllAdmin(), appointmentsAPI.getAll()])
      .then(([s, b, a]) => { setStats(s.data); setBusinesses(b.data); setAppointments(a.data); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><div className="text-slate-400 text-sm">Loading…</div></Layout>;

  return (
    <Layout>
      <div className="mb-6"><h1 className="page-title">Super Admin Dashboard</h1><p className="page-subtitle">System-wide overview across all businesses</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Businesses"   value={stats?.businesses  || 0} icon="🏢" color="blue" />
        <StatCard label="Total Staff"        value={stats?.staff       || 0} icon="👤" color="purple" />
        <StatCard label="Total Customers"    value={stats?.customers   || 0} icon="👥" color="emerald" />
        <StatCard label="Total Appointments" value={stats?.appointments|| 0} icon="📅" color="amber" />
      </div>

      <div className="card p-0 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Businesses Overview</h2>
          <a href="/super-admin/businesses" className="text-sm text-primary-600 hover:underline">Manage all →</a>
        </div>
        <div className="table-wrapper border-0 rounded-none">
          <table className="table">
            <thead><tr><th>Business</th><th>Category</th><th>Staff</th><th>Services</th><th>Appointments</th><th>Status</th></tr></thead>
            <tbody>
              {businesses.slice(0,6).map(b => (
                <tr key={b.id}>
                  <td className="font-medium">
                    <div className="flex items-center gap-2">{getCategoryIcon(b.category)} {b.name}</div>
                  </td>
                  <td><span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{b.category}</span></td>
                  <td>{b.staffCount}</td>
                  <td>{b.serviceCount}</td>
                  <td>{b.appointmentCount}</td>
                  <td><span className={'badge ' + (b.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>{b.is_active ? 'Active' : 'Inactive'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100"><h2 className="font-semibold text-slate-800">Recent Appointments (All Businesses)</h2></div>
        <div className="table-wrapper border-0 rounded-none">
          <table className="table">
            <thead><tr><th>Business</th><th>Customer</th><th>Service</th><th>Staff</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {appointments.slice(0,10).length === 0 ? (
                <tr><td colSpan={6} className="text-center text-slate-400 py-8">No appointments yet.</td></tr>
              ) : appointments.slice(0,10).map(a => (
                <tr key={a.id}>
                  <td className="font-medium">
                    <div className="flex items-center gap-1">{getCategoryIcon(a.business?.category)} {a.business?.name || '—'}</div>
                  </td>
                  <td>{a.customer?.name || '—'}</td>
                  <td>{a.service?.name  || '—'}</td>
                  <td>{a.staff?.name    || '—'}</td>
                  <td>{a.appointment_date}</td>
                  <td><span className={'badge ' + (a.status==='BOOKED' ? 'badge-booked' : a.status==='COMPLETED' ? 'badge-completed' : 'badge-cancelled')}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};
export default SuperAdminDashboard;
