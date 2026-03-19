import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { superAdminAPI } from '../../api';

const roleColors = { SUPER_ADMIN:'bg-purple-100 text-purple-700', ADMIN:'bg-blue-100 text-blue-700', STAFF:'bg-teal-100 text-teal-700', CUSTOMER:'bg-emerald-100 text-emerald-700' };

const SuperAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editModal, setEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ email: '', password: '', role: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    superAdminAPI.getUsers().then(r => setUsers(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const matchSearch = u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({ 
      email: user.email, 
      password: '', 
      role: user.role 
    });
    setError('');
    setEditModal(true);
  };

  const closeEditModal = () => {
    setEditModal(false);
    setEditingUser(null);
    setEditForm({ email: '', password: '', role: '' });
    setError('');
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      const updateData = {};
      if (editForm.email !== editingUser.email) updateData.email = editForm.email;
      if (editForm.password) updateData.password = editForm.password;
      if (editForm.role !== editingUser.role) updateData.role = editForm.role;
      
      const updated = await superAdminAPI.updateUser(editingUser.id, updateData);
      setUsers(users.map(u => u.id === editingUser.id ? updated.data : u));
      closeEditModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6 xs:ml-20 xs:mt-4"><h1 className="page-title">All Users</h1><p className="page-subtitle">System-wide user accounts</p></div>
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
            <thead><tr><th>#</th><th>Email</th><th>Role</th><th>Business</th><th>Category</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-slate-400 py-8">No users found.</td></tr>
              ) : filtered.map((u, i) => (
                <tr key={u.id}>
                  <td className="text-slate-400">{i+1}</td>
                  <td className="font-medium">{u.email}</td>
                  <td><span className={'badge ' + (roleColors[u.role]||'')}>{u.role}</span></td>
                  <td className="text-slate-500">{u.business?.name || <span className="text-slate-300">—</span>}</td>
                  <td>{u.business?.category ? <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{u.business.category}</span> : <span className="text-slate-300">—</span>}</td>
                  <td className="text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="btn-secondary text-xs py-1 px-2" 
                      onClick={() => openEditModal(u)}
                      disabled={u.role !== 'ADMIN'}
                      title={u.role === 'ADMIN' ? 'Edit admin credentials' : u.role === 'SUPER_ADMIN' ? 'Cannot edit Super Admin' : 'Only admin users can be edited'}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <Modal open={editModal} onClose={closeEditModal} title="Edit User">
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input 
              type="email" 
              className="input" 
              value={editForm.email}
              onChange={e => setEditForm({ ...editForm, email: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="label">New Password <span className="text-slate-400 font-normal">(leave empty to keep current)</span></label>
            <input 
              type="password" 
              className="input" 
              placeholder="Enter new password"
              value={editForm.password}
              onChange={e => setEditForm({ ...editForm, password: e.target.value })}
              minLength={6}
            />
          </div>
          
          <div>
            <label className="label">Role</label>
            <select 
              className="input"
              value={editForm.role}
              onChange={e => setEditForm({ ...editForm, role: e.target.value })}
              disabled={editingUser?.role === 'SUPER_ADMIN'}
            >
              <option value="ADMIN">Admin</option>
              <option value="STAFF">Staff</option>
              <option value="CUSTOMER">Customer</option>
            </select>
            {editingUser?.role === 'SUPER_ADMIN' && (
              <p className="text-xs text-amber-600 mt-1">Super Admin role cannot be changed</p>
            )}
          </div>
          
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Updating…' : 'Update User'}
            </button>
            <button type="button" className="btn-secondary flex-1" onClick={closeEditModal}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
export default SuperAdminUsers;
