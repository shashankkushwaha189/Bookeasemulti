import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { businessAPI } from '../../api';
import { CATEGORIES, getCategoryIcon } from '../../config/categories';

const BusinessList = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    businessAPI.getAll().then(r => setBusinesses(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = businesses.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.speciality || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All' || b.category === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <Layout>
      <div className="mb-4 xs:mb-3 w-full max-w-full px-4 xs:px-2 xs:ml-20 xs:mt-4">
        <h1 className="page-title">Find & Book</h1>
        <p className="page-subtitle">Browse businesses and book appointments instantly</p>
      </div>

      <div className="w-full max-w-full px-4 xs:px-2 mb-4 xs:mb-3">
        <input className="input w-full max-w-full" placeholder="Search businesses, speciality…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 xs:mb-4 flex-wrap w-full max-w-full overflow-x-hidden px-4 xs:px-2">
        <button className={'btn text-sm py-1.5 px-3 xs:py-1 xs:px-2 xs:text-xs flex-shrink-0 ' + (catFilter === 'All' ? 'btn-primary' : 'btn-secondary')} onClick={() => setCatFilter('All')}>🏢 All</button>
        {CATEGORIES.map(cat => (
          <button key={cat.value} className={'btn text-sm py-1.5 px-3 xs:py-1 xs:px-2 xs:text-xs flex-shrink-0 min-w-0 ' + (catFilter === cat.value ? 'btn-primary' : 'btn-secondary')} onClick={() => setCatFilter(cat.value)}>
            <span className="xs:hidden">{cat.icon} </span><span className="truncate max-w-[80px] xs:max-w-[60px]">{cat.label}</span>
          </button>
        ))}
      </div>

      {loading ? <div className="text-slate-400 text-sm xs:text-xs text-center py-8 w-full px-4 xs:px-2">Loading…</div> :
        filtered.length === 0 ? <div className="text-center py-16 xs:py-8 text-slate-400 xs:text-xs w-full px-4 xs:px-2">No businesses found.</div> : (
          <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xs:gap-3 w-full max-w-full px-4 xs:px-2">
            {filtered.map(b => (
              <div key={b.id} className="card hover:shadow-md transition-shadow cursor-pointer group xs:p-4 w-full max-w-full overflow-hidden" onClick={() => navigate('/businesses/' + b.id)}>
                <div className="flex items-start gap-4 xs:gap-3">
                  <div className="w-12 h-12 xs:w-10 xs:h-10 rounded-xl bg-primary-100 flex items-center justify-center text-2xl xs:text-lg flex-shrink-0">
                    {getCategoryIcon(b.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">{b.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{b.category}</span>
                      {b.speciality && <span className="text-xs text-primary-600 font-medium">{b.speciality}</span>}
                    </div>
                    {b.address && <p className="text-sm text-slate-500 mt-1 truncate">📍 {b.address}</p>}
                    {b.phone && <p className="text-sm text-slate-500">📞 {b.phone}</p>}
                    {b.description && <p className="text-sm text-slate-400 mt-2 line-clamp-2">{b.description}</p>}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <button className="btn-primary w-full text-sm">Book Appointment →</button>
                </div>
              </div>
            ))}
          </div>
        )}
    </Layout>
  );
};
export default BusinessList;
