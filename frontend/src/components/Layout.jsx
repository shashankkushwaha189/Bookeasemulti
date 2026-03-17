import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../routes/AuthContext';
import { getCategoryIcon } from '../config/categories';
import { useState } from 'react';

const navLinks = {
  SUPER_ADMIN: [
    { to: '/super-admin/dashboard', label: 'Dashboard',  icon: '📊' },
    { to: '/super-admin/businesses',label: 'Businesses', icon: '🏢' },
    { to: '/super-admin/users',     label: 'Users',      icon: '👥' },
  ],
  ADMIN: [
    { to: '/admin/dashboard',    label: 'Dashboard',    icon: '📊' },
    { to: '/admin/services',     label: 'Services',     icon: '✂️'  },
    { to: '/admin/staff',        label: 'Staff',        icon: '👤' },
    { to: '/admin/appointments', label: 'Appointments', icon: '📅' },
  ],
  STAFF: [{ to: '/staff/dashboard', label: 'My Schedule', icon: '📋' }],
  CUSTOMER: [
    { to: '/businesses',      label: 'Browse',          icon: '🔍' },
    { to: '/my-appointments', label: 'My Appointments', icon: '🗂️' },
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 xs:block sm:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-slate-200 xs:flex sm:hidden"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <aside className={`w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-50 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } xs:translate-x-0 sm:translate-x-0`}>
        <div className="p-6 xs:p-4 border-b border-slate-100">
          <div className="flex items-center gap-3 xs:gap-2">
            <div className="w-9 h-9 xs:w-8 xs:h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg xs:text-sm">B</div>
            <div>
              <h1 className="font-bold text-slate-900 text-lg xs:text-base leading-none">BookEase</h1>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[130px] xs:max-w-[100px]">
                {user?.businessName ? businessIcon + ' ' + user.businessName : 'All Businesses'}
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 xs:px-2 xs:py-3 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={'flex items-center gap-3 px-3 py-2.5 xs:px-2 xs:py-2 rounded-lg text-sm font-medium transition-all ' +
                  (active ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')}>
                <span className="text-base xs:text-sm">{link.icon}</span>
                <span className="xs:text-xs">{link.label}</span>
              </Link>
            );
          })}
        </nav>
        {user && (
          <div className="p-4 xs:p-3 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-3 xs:gap-2 xs:mb-2">
              <div className="w-8 h-8 xs:w-7 xs:h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
                {(user.name || user.email)?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate xs:text-xs">{user.name || user.email}</p>
                <span className={'text-xs px-1.5 py-0.5 rounded font-medium ' + (roleColors[user.role] || '')}>{user.role}</span>
              </div>
            </div>
            <button onClick={() => { logout(); navigate('/login'); }} className="w-full btn-secondary text-xs py-1.5 xs:py-1">Sign out</button>
          </div>
        )}
      </aside>
      <main className="flex-1 ml-64 xs:ml-0 p-8 xs:p-4 xs:pt-16">{children}</main>
    </div>
  );
};

export default Layout;
