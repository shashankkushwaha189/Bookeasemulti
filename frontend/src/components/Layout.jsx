import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../routes/AuthContext';
import { getCategoryIcon } from '../config/categories';
import { useState } from 'react';
import {
  ChartPieIcon,
  BuildingOfficeIcon,
  UsersIcon,
  ScissorsIcon,
  UserIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  QueueListIcon,
  Bars3Icon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

const navLinks = {
  SUPER_ADMIN: [
    { to: '/super-admin/dashboard', label: 'Dashboard',  icon: ChartPieIcon },
    { to: '/super-admin/businesses',label: 'Businesses', icon: BuildingOfficeIcon },
    { to: '/super-admin/users',     label: 'Users',      icon: UsersIcon },
  ],
  ADMIN: [
    { to: '/admin/dashboard',    label: 'Dashboard',    icon: ChartPieIcon },
    { to: '/admin/services',     label: 'Services',     icon: ScissorsIcon  },
    { to: '/admin/staff',        label: 'Staff',        icon: UserIcon },
    { to: '/admin/appointments', label: 'Appointments', icon: CalendarDaysIcon },
  ],
  STAFF: [{ to: '/staff/dashboard', label: 'My Schedule', icon: QueueListIcon }],
  CUSTOMER: [
    { to: '/businesses',      label: 'Browse',          icon: MagnifyingGlassIcon },
    { to: '/my-appointments', label: 'My Appointments', icon: QueueListIcon },
  ],
};

const roleColors = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-700',
  ADMIN:       'bg-blue-100 text-blue-700',
  STAFF:       'bg-teal-100 text-teal-700',
  CUSTOMER:    'bg-emerald-100 text-emerald-700',
};

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const links = user ? navLinks[user.role] || [] : [];

  const businessIcon = user?.businessCategory ? getCategoryIcon(user.businessCategory) : '🏢';

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 block sm:hidden" 
          onClick={() => setSidebarOpen(false)}
          style={{ zIndex: 45 }}
        />
      )}
      
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed top-3 left-3 z-50 p-2 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/60 flex sm:hidden transition-all duration-300 hover:bg-white ${
          sidebarOpen ? 'opacity-0 pointer-events-none translate-x-[-20px]' : 'opacity-100 translate-x-0'
        }`}
        style={{ zIndex: 60 }}
      >
        <Bars3Icon className="w-5 h-5 text-slate-700" />
      </button>

      <aside className={`w-72 bg-white/70 backdrop-blur-2xl border-r border-slate-200/50 flex flex-col fixed sm:relative h-full sm:h-auto transform transition-all duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
        sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full shadow-none'
      } sm:translate-x-0`} style={{ zIndex: 55 }}>
        <div className="p-7 xs:p-5 border-b border-slate-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="flex items-center gap-4 xs:gap-3 relative z-10">
            <div className="w-10 h-10 xs:w-9 xs:h-9 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl xs:text-base shadow-lg shadow-primary-500/30">B</div>
            <div>
              <h1 className="font-extrabold text-slate-900 text-xl xs:text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">BookEase</h1>
              <div className="flex items-center gap-1 mt-0.5 opacity-80">
                <BriefcaseIcon className="w-3.5 h-3.5 text-slate-500" />
                <p className="text-xs font-medium text-slate-500 truncate max-w-[140px] xs:max-w-[120px]">
                  {user?.businessName ? user.businessName : 'All Businesses'}
                </p>
              </div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 xs:px-3 xs:py-4 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const active = location.pathname === link.to;
            const Icon = link.icon;
            return (
              <Link key={link.to} to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3.5 px-3 py-2.5 xs:px-2.5 xs:py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  active 
                    ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100/50' 
                    : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-900 border border-transparent'
                }`}>
                <Icon className={`w-[22px] h-[22px] flex-shrink-0 transition-colors ${active ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`} strokeWidth={active ? 2 : 1.5} />
                <span className="xs:text-sm tracking-tight">{link.label}</span>
              </Link>
            );
          })}
        </nav>
        {user && (
          <div className="p-5 xs:p-4 border-t border-slate-200/50 bg-slate-50/50">
            <div className="flex items-center gap-3.5 mb-4 xs:gap-3 xs:mb-3">
              <div className="w-[38px] h-[38px] xs:w-8 xs:h-8 rounded-full bg-gradient-to-br from-indigo-100 to-primary-100 text-primary-700 flex items-center justify-center shadow-sm border border-primary-200/50 font-bold">
                {(user.name || user.email)?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate tracking-tight">{user.name || user.email}</p>
                <div className="mt-0.5">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${roleColors[user.role] || ''}`}>{user.role}</span>
                </div>
              </div>
            </div>
            <button onClick={() => { logout(); navigate('/login'); }} className="w-full btn-secondary text-sm py-2 xs:py-1.5 shadow-sm border-slate-200 hover:border-slate-300 font-semibold text-slate-700">Sign out</button>
          </div>
        )}
      </aside>
      <main className={`flex-1 p-6 xs:p-4 pt-16 xs:pt-14 w-full h-screen overflow-y-auto transition-all duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)] bg-slate-50/50 ${
        sidebarOpen ? 'ml-72 sm:ml-72' : 'ml-0 sm:ml-72'
      }`}>{children}</main>
    </div>
  );
};

export default Layout;
