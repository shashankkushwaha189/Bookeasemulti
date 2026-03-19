import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { businessAPI } from '../../api';
import { CATEGORIES, getCategoryIcon } from '../../config/categories';

const empty = { name: '', category: 'Healthcare', address: '', phone: '', description: '', speciality: '', currency: '₹', adminEmail: '', adminPassword: '' };

const SuperAdminBusinesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [catFilter, setCatFilter] = useState('All');

  const load = () => businessAPI.getAllAdmin().then(r => setBusinesses(r.data)).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setEditing(null); setForm(empty); setError(''); setOpen(true); };
  const openEdit = (b) => { setEditing(b); setForm({ name: b.name, category: b.category, address: b.address||'', phone: b.phone||'', description: b.description||'', speciality: b.speciality||'', currency: b.currency||'₹', adminEmail: '', adminPassword: '' }); setError(''); setOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      editing
        ? await businessAPI.update(editing.id, { name: form.name, category: form.category, address: form.address, phone: form.phone, description: form.description, speciality: form.speciality, currency: form.currency })
        : await businessAPI.create(form);
      setOpen(false); load();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (b) => {
    try { await businessAPI.update(b.id, { is_active: !b.is_active }); load(); }
    catch { alert('Failed to update.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this business and ALL its data? This cannot be undone.')) return;
    try { await businessAPI.delete(id); setBusinesses(prev => prev.filter(b => b.id !== id)); }
    catch (err) { alert(err.response?.data?.message || 'Failed to delete.'); }
  };

  const filtered = catFilter === 'All' ? businesses : businesses.filter(b => b.category === catFilter);

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between xs:ml-20 xs:mt-4">
        <div><h1 className="page-title">Businesses</h1><p className="page-subtitle">Manage all businesses in the system</p></div>
        <button className="btn-primary xs:mr-4" onClick={openAdd}>+ Add Business</button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <button className={'btn text-xs py-1.5 px-3 ' + (catFilter==='All' ? 'btn-primary' : 'btn-secondary')} onClick={() => setCatFilter('All')}>All ({businesses.length})</button>
        {CATEGORIES.map(cat => {
          const count = businesses.filter(b => b.category === cat.value).length;
          if (!count) return null;
          return (
            <button key={cat.value} className={'btn text-xs py-1.5 px-3 ' + (catFilter===cat.value ? 'btn-primary' : 'btn-secondary')} onClick={() => setCatFilter(cat.value)}>
              {cat.icon} {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {loading ? <div className="text-slate-400 text-sm">Loading…</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(b => (
            <div key={b.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-primary-100 rounded-xl flex items-center justify-center text-2xl">{getCategoryIcon(b.category)}</div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{b.name}</h3>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{b.category}</span>
                  </div>
                </div>
                <span className={'badge ' + (b.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>{b.is_active ? 'Active' : 'Inactive'}</span>
              </div>
              {b.speciality && <p className="text-xs text-primary-600 font-medium mb-1">{b.speciality}</p>}
              {b.address && <p className="text-sm text-slate-500 mb-1">📍 {b.address}</p>}
              {b.phone && <p className="text-sm text-slate-500 mb-3">📞 {b.phone}</p>}
              <div className="flex gap-2 text-xs text-slate-500 mb-4">
                <span className="bg-slate-100 px-2 py-1 rounded">{b.staffCount} staff</span>
                <span className="bg-slate-100 px-2 py-1 rounded">{b.serviceCount} services</span>
                <span className="bg-slate-100 px-2 py-1 rounded">{b.appointmentCount} appts</span>
              </div>
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button className="btn-secondary text-xs py-1 px-2 flex-1" onClick={() => openEdit(b)}>Edit</button>
                <button className={'btn text-xs py-1 px-2 flex-1 ' + (b.is_active ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100' : 'btn-success')} onClick={() => handleToggle(b)}>{b.is_active ? 'Deactivate' : 'Activate'}</button>
                <button className="btn-danger text-xs py-1 px-2" onClick={() => handleDelete(b.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Business' : 'Add New Business'}>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <div><label className="label">Business Name *</label><input className="input" placeholder="e.g. Glamour Studio" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
          <div>
            <label className="label">Category *</label>
            <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          <div><label className="label">Speciality</label><input className="input" placeholder="e.g. Hair & Beauty, Cardiology…" value={form.speciality} onChange={e => setForm({ ...form, speciality: e.target.value })} /></div>
          <div><label className="label">Address</label><input className="input" placeholder="123 Main St, City" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
          <div><label className="label">Phone</label><input className="input" placeholder="+91 9876543210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <div><label className="label">Description</label><textarea className="input resize-none" rows={2} placeholder="About this business…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div><label className="label">Currency Symbol</label><input className="input" placeholder="₹ or $ or €" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} /></div>
          {!editing && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Admin Account (optional)</p>
              <div className="space-y-3">
                <div><label className="label">Admin Email</label><input type="email" className="input" placeholder="admin@business.com" value={form.adminEmail} onChange={e => setForm({ ...form, adminEmail: e.target.value })} /></div>
                <div><label className="label">Admin Password</label><input type="password" className="input" placeholder="Min 6 characters" value={form.adminPassword} onChange={e => setForm({ ...form, adminPassword: e.target.value })} /></div>
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Create Business'}</button>
            <button type="button" className="btn-secondary flex-1" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
export default SuperAdminBusinesses;
