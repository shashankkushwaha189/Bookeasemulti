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
  XMarkIcon,
  BriefcaseIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';

const navLinks = {
  SUPER_ADMIN: [
    { to: '/super-admin/dashboard',  label: 'Dashboard',   icon: ChartPieIcon },
    { to: '/super-admin/businesses', label: 'Businesses',  icon: BuildingOfficeIcon },
    { to: '/super-admin/users',      label: 'Users',       icon: UsersIcon },
  ],
  ADMIN: [
    { to: '/admin/dashboard',    label: 'Dashboard',    icon: ChartPieIcon },
    { to: '/admin/services',     label: 'Services',     icon: ScissorsIcon },
    { to: '/admin/staff',        label: 'Staff',        icon: UserIcon },
    { to: '/admin/appointments', label: 'Appointments', icon: CalendarDaysIcon },
  ],
  STAFF:    [{ to: '/staff/dashboard',  label: 'My Schedule',     icon: QueueListIcon }],
  CUSTOMER: [
    { to: '/businesses',      label: 'Browse',          icon: MagnifyingGlassIcon },
    { to: '/my-appointments', label: 'My Appointments', icon: QueueListIcon },
  ],
};

const roleColors = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-700',
  ADMIN:       'bg-blue-100   text-blue-700',
  STAFF:       'bg-teal-100   text-teal-700',
  CUSTOMER:    'bg-emerald-100 text-emerald-700',
};

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const links = user ? navLinks[user.role] || [] : [];

  return (
    <div className="relative flex min-h-screen bg-slate-50">

      {/* ── Mobile backdrop ─────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Hamburger (mobile only) ──────────────────────── */}
      <button
        aria-label="Open menu"
        onClick={() => setSidebarOpen(true)}
        className="fixed top-3 left-3 z-50 p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/60 lg:hidden transition hover:bg-white"
      >
        <Bars3Icon className="w-5 h-5 text-slate-700" />
      </button>

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex h-full w-[280px] flex-col
          bg-white/80 backdrop-blur-2xl border-r border-slate-200/50
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:shadow-none lg:w-72
        `}
      >
        {/* Sidebar header */}
        <div className="p-6 border-b border-slate-200/50 relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/30">
                B
              </div>
              <div>
                <h1 className="font-extrabold text-slate-900 text-xl tracking-tight leading-none">BookEase</h1>
                <div className="flex items-center gap-1 mt-1 opacity-70">
                  <BriefcaseIcon className="w-3 h-3 text-slate-500 flex-shrink-0" />
                  <p className="text-xs font-medium text-slate-500 truncate max-w-[130px]">
                    {user?.businessName || 'All Businesses'}
                  </p>
                </div>
              </div>
            </div>

            {/* Close button – mobile only */}
            <button
              aria-label="Close menu"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const active = location.pathname === link.to;
            const Icon   = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                  transition-all duration-150
                  ${active
                    ? 'bg-primary-50 text-primary-700 border border-primary-100/60 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 border border-transparent'}
                `}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-colors
                    ${active ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`}
                  strokeWidth={active ? 2 : 1.5}
                />
                <span className="tracking-tight">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        {user && (
          <div className="p-4 border-t border-slate-200/50 bg-slate-50/60 flex-shrink-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-primary-100 text-primary-700 flex items-center justify-center shadow-sm border border-primary-200/50 font-bold text-sm flex-shrink-0">
                {(user.name || user.email)?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate tracking-tight">{user.name || user.email}</p>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-0.5 ${roleColors[user.role] || ''}`}>
                  {user.role?.replace('_', ' ')}
                </span>
              </div>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
            >
              <ArrowLeftOnRectangleIcon className="w-4 h-4" />
              Sign out
            </button>
          </div>
        )}
      </aside>

      {/* ── Main content ─────────────────────────────────── */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto pt-14 lg:pt-0 bg-slate-50/50">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
