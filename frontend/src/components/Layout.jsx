import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../routes/AuthContext';
import { getCategoryIcon } from '../config/categories';

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
  const links = user ? navLinks[user.role] || [] : [];

  const businessIcon = user?.businessCategory ? getCategoryIcon(user.businessCategory) : '🏢';

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">B</div>
            <div>
              <h1 className="font-bold text-slate-900 text-lg leading-none">BookEase</h1>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[130px]">
                {user?.businessName ? businessIcon + ' ' + user.businessName : 'All Businesses'}
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to}
                className={'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ' +
                  (active ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')}>
                <span className="text-base">{link.icon}</span>{link.label}
              </Link>
            );
          })}
        </nav>
        {user && (
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
                {(user.name || user.email)?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{user.name || user.email}</p>
                <span className={'text-xs px-1.5 py-0.5 rounded font-medium ' + (roleColors[user.role] || '')}>{user.role}</span>
              </div>
            </div>
            <button onClick={() => { logout(); navigate('/login'); }} className="w-full btn-secondary text-xs py-1.5">Sign out</button>
          </div>
        )}
      </aside>
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
};

export default Layout;
