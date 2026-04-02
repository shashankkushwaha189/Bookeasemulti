import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { servicesAPI } from '../../api';
import { useAuth } from '../../routes/AuthContext';
import { getServiceLabel } from '../../config/categories';

const empty = { name: '', duration_minutes: 30, price: '' };

const AdminServices = () => {
  const { user } = useAuth();
  const serviceLabel = getServiceLabel(user?.businessCategory);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => servicesAPI.getAll().then(r => setServices(r.data)).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setEditing(null); setForm(empty); setError(''); setOpen(true); };
  const openEdit = (s) => { setEditing(s); setForm({ name: s.name, duration_minutes: s.duration_minutes, price: s.price }); setError(''); setOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      editing ? await servicesAPI.update(editing.id, form) : await servicesAPI.create(form);
      setOpen(false); load();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try { await servicesAPI.delete(id); setServices(prev => prev.filter(s => s.id !== id)); }
    catch (err) { alert(err.response?.data?.message || 'Failed to delete.'); }
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="page-title">Services</h1>
          <p className="page-subtitle">Manage {serviceLabel.toLowerCase()}s offered at your business</p>
        </div>
        <button className="btn-primary self-start sm:self-auto" onClick={openAdd}>+ Add Service</button>
      </div>

      {loading ? <div className="text-slate-400 text-sm">Loading…</div> : (
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>#</th><th>Name</th><th>Duration</th><th>Price</th><th>Actions</th></tr></thead>
            <tbody>
              {services.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-slate-400 py-8">No services yet. Add one to get started.</td></tr>
              ) : services.map((s, i) => (
                <tr key={s.id}>
                  <td className="text-slate-400">{i+1}</td>
                  <td className="font-medium">{s.name}</td>
                  <td>{s.duration_minutes} min</td>
                  <td>₹{parseFloat(s.price).toFixed(2)}</td>
                  <td><div className="flex gap-2"><button className="btn-secondary text-xs py-1 px-2" onClick={() => openEdit(s)}>Edit</button><button className="btn-danger text-xs py-1 px-2" onClick={() => handleDelete(s.id)}>Delete</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Service' : 'Add Service'}>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Name</label><input className="input" placeholder="e.g. Haircut, Consultation…" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
          <div><label className="label">Duration (minutes)</label><input type="number" className="input" min={5} value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: parseInt(e.target.value) })} required /></div>
          <div><label className="label">Price (₹)</label><input type="number" className="input" min={0} step="0.01" placeholder="0.00" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required /></div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Add'}</button>
            <button type="button" className="btn-secondary flex-1" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
export default AdminServices;
