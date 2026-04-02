import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { superAdminAPI } from '../../api';

const roleColors = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-blue-100 text-blue-700',
  STAFF: 'bg-teal-100 text-teal-700',
  CUSTOMER: 'bg-emerald-100 text-emerald-700'
};

const SuperAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editModal, setEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ email: '', role: '' });
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

  const openEdit = (user) => {
    setEditingUser(user);
    setEditForm({ 
      email: user.email, 
      role: user.role 
    });
    setError('');
    setEditModal(true);
  };

  const closeEditModal = () => {
    setEditModal(false);
    setEditingUser(null);
    setEditForm({ email: '', role: '' });
    setError('');
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      const updateData = {};
      if (editForm.email !== editingUser.email) updateData.email = editForm.email;
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
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-title">All Users</h1>
            <p className="page-subtitle">System-wide user accounts</p>
          </div>
          <div className="flex flex-col xs:flex-row gap-2">
            <input
              className="input"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              className="input"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="STAFF">Staff</option>
              <option value="CUSTOMER">Customer</option>
            </select>
          </div>
        </div>
      </div>


      {loading ? (
        <div className="text-slate-400 text-sm">Loading…</div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Email</th>
                <th>Role</th>
                <th>Business</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id}>
                  <td>{i + 1}</td>
                  <td>{u.email}</td>
                  <td><span className={`px-2 py-1 rounded-full text-xs ${roleColors[u.role] || 'bg-gray-100 text-gray-700'}`}>{u.role}</span></td>
                  <td>{u.business?.name || '—'}</td>
                  <td>
                    <button 
                      onClick={() => openEdit(u)}
                      className="btn-secondary text-xs py-1 px-2" 
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
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default SuperAdminUsers;
