import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { staffAPI } from '../../api';
import { useAuth } from '../../routes/AuthContext';
import { getStaffLabel } from '../../config/categories';

const empty = { name: '', specialization: '', email: '', password: '' };

const AdminStaff = () => {
  const { user } = useAuth();
  const staffLabel = getStaffLabel(user?.businessCategory);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => staffAPI.getAll().then(r => setStaff(r.data)).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setEditing(null); setForm(empty); setError(''); setOpen(true); };
  const openEdit = (s) => { setEditing(s); setForm({ name: s.name, specialization: s.specialization || '', email: '', password: '' }); setError(''); setOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      editing ? await staffAPI.update(editing.id, { name: form.name, specialization: form.specialization }) : await staffAPI.create(form);
      setOpen(false); load();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this staff member?')) return;
    try { await staffAPI.delete(id); setStaff(prev => prev.filter(s => s.id !== id)); }
    catch (err) { alert(err.response?.data?.message || 'Failed to delete.'); }
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="page-title">Staff</h1><p className="page-subtitle">Manage {staffLabel.toLowerCase()}s at your business</p></div>
        <button className="btn-primary" onClick={openAdd}>+ Add {staffLabel}</button>
      </div>

      {loading ? <div className="text-slate-400 text-sm">Loading…</div> : (
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>#</th><th>Name</th><th>Specialization</th><th>Email</th><th>Actions</th></tr></thead>
            <tbody>
              {staff.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-slate-400 py-8">No {staffLabel.toLowerCase()}s yet.</td></tr>
              ) : staff.map((s, i) => (
                <tr key={s.id}>
                  <td className="text-slate-400">{i+1}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">{s.name?.[0]?.toUpperCase()}</div>
                      <span className="font-medium">{s.name}</span>
                    </div>
                  </td>
                  <td>{s.specialization || <span className="text-slate-400">—</span>}</td>
                  <td className="text-slate-500">{s.user?.email || '—'}</td>
                  <td><div className="flex gap-2"><button className="btn-secondary text-xs py-1 px-2" onClick={() => openEdit(s)}>Edit</button><button className="btn-danger text-xs py-1 px-2" onClick={() => handleDelete(s.id)}>Delete</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit ' + staffLabel : 'Add ' + staffLabel}>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Full Name</label><input className="input" placeholder="e.g. Dr. Smith / Sara Khan" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
          <div><label className="label">Specialization</label><input className="input" placeholder="e.g. Hair Stylist, Cardiologist…" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} /></div>
          {!editing && <>
            <div><label className="label">Email</label><input type="email" className="input" placeholder="staff@business.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
            <div><label className="label">Password</label><input type="password" className="input" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} /></div>
          </>}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Add ' + staffLabel}</button>
            <button type="button" className="btn-secondary flex-1" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
export default AdminStaff;
