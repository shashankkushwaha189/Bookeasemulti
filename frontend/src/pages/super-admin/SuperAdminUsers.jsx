import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { superAdminAPI } from '../../api';

const roleColors = { SUPER_ADMIN:'bg-purple-100 text-purple-700', ADMIN:'bg-blue-100 text-blue-700', STAFF:'bg-teal-100 text-teal-700', CUSTOMER:'bg-emerald-100 text-emerald-700' };

const SuperAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    superAdminAPI.getUsers().then(r => setUsers(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const matchSearch = u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <Layout>
      <div className="mb-6"><h1 className="page-title">All Users</h1><p className="page-subtitle">System-wide user accounts</p></div>
      <div className="flex gap-3 mb-5 flex-wrap">
        <input className="input max-w-xs" placeholder="Search by email…" value={search} onChange={e => setSearch(e.target.value)} />
        <div className="flex gap-2 flex-wrap">
          {['all','SUPER_ADMIN','ADMIN','STAFF','CUSTOMER'].map(r => (
            <button key={r} className={'btn text-xs py-1.5 px-3 ' + (roleFilter===r ? 'btn-primary' : 'btn-secondary')} onClick={() => setRoleFilter(r)}>{r==='all' ? 'All' : r}</button>
          ))}
        </div>
      </div>
      {loading ? <div className="text-slate-400 text-sm">Loading…</div> : (
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>#</th><th>Email</th><th>Role</th><th>Business</th><th>Category</th><th>Joined</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-slate-400 py-8">No users found.</td></tr>
              ) : filtered.map((u, i) => (
                <tr key={u.id}>
                  <td className="text-slate-400">{i+1}</td>
                  <td className="font-medium">{u.email}</td>
                  <td><span className={'badge ' + (roleColors[u.role]||'')}>{u.role}</span></td>
                  <td className="text-slate-500">{u.business?.name || <span className="text-slate-300">—</span>}</td>
                  <td>{u.business?.category ? <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{u.business.category}</span> : <span className="text-slate-300">—</span>}</td>
                  <td className="text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};
export default SuperAdminUsers;
