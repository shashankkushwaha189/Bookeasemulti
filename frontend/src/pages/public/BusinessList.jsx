import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { businessAPI } from '../../api';
import { CATEGORIES } from '../../config/categories';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  ArrowRightIcon,
  StarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';

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
      <div className="relative mb-6 xs:mb-4 w-full max-w-full px-4 xs:px-2 pt-6">
        {/* Subtle background glow effect for the header */}
        <div className="absolute top-0 left-0 w-[60%] h-full bg-gradient-to-r from-primary-400/10 to-transparent blur-3xl pointer-events-none -z-10"></div>
        
        <div className="flex items-center gap-2 mb-1">
          <SparklesIcon className="w-6 h-6 text-primary-500" />
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Find & Book</h1>
        </div>
        <p className="text-slate-500 font-medium tracking-wide">Browse premium businesses and book appointments instantly</p>
      </div>

      <div className="w-full max-w-full px-4 xs:px-2 mb-6 xs:mb-4 relative group">
        <MagnifyingGlassIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
        <input 
          className="w-full px-4 py-4 pl-12 bg-white/60 backdrop-blur-md shadow-sm border border-slate-200/60 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-slate-800 placeholder-slate-400" 
          placeholder="Search by name, speciality..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2.5 mb-8 xs:mb-6 flex-nowrap overflow-x-auto w-full px-4 xs:px-2 pb-2 scrollbar-hide">
        <button 
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shadow-sm ${catFilter === 'All' ? 'bg-slate-900 text-white shadow-slate-900/20' : 'bg-white text-slate-600 border border-slate-200/60 hover:bg-slate-50'}`} 
          onClick={() => setCatFilter('All')}
        >
          <BuildingOfficeIcon className={`w-4 h-4 ${catFilter === 'All' ? 'text-white' : 'text-slate-400'}`} /> All Categories
        </button>
        {CATEGORIES.map(cat => (
          <button 
            key={cat.value} 
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shadow-sm ${catFilter === cat.value ? 'bg-primary-600 text-white shadow-primary-600/20' : 'bg-white text-slate-600 border border-slate-200/60 hover:bg-slate-50'}`} 
            onClick={() => setCatFilter(cat.value)}
          >
            <span className="truncate max-w-[120px]">{cat.label}</span>
          </button>
        ))}
      </div>

      {loading ? <div className="text-slate-400 text-sm font-medium text-center py-12 flex justify-center animate-pulse">Loading amazing places...</div> :
        filtered.length === 0 ? <div className="text-center py-16 text-slate-400 font-medium">No businesses found matching your criteria.</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 xs:px-2 pb-12">
            {filtered.map(b => (
              <div 
                key={b.id} 
                className="group relative bg-white/80 backdrop-blur-xl border border-white max-w-full overflow-hidden rounded-3xl shadow-xl shadow-slate-200/30 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 cursor-pointer flex flex-col transform hover:-translate-y-1" 
                onClick={() => navigate('/businesses/' + b.id)}
              >
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl shadow-inner border border-primary-200/50">
                      {b.name.charAt(0).toUpperCase()}
                    </div>
                    {b.rating && (
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-200/50">
                        <StarIcon className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold text-yellow-700">{b.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-xl text-slate-800 group-hover:text-primary-600 transition-colors mb-1 tracking-tight truncate flex items-center gap-1">
                    {b.name} <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200/60">{b.category}</span>
                    {b.speciality && <span className="text-xs text-primary-600 font-semibold">{b.speciality}</span>}
                  </div>
                  
                  <div className="space-y-2 mt-2">
                    {b.address && (
                      <div className="flex items-start gap-2 text-slate-500">
                        <MapPinIcon className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
                        <p className="text-sm font-medium line-clamp-1">{b.address}</p>
                      </div>
                    )}
                    {b.phone && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <PhoneIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <p className="text-sm font-medium truncate">{b.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 group-hover:bg-primary-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-md group-hover:shadow-primary-600/30">
                    Book Appointment <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
    </Layout>
  );
};
export default BusinessList;
