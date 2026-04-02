const colors = {
  blue:    'bg-gradient-to-br from-blue-50    to-blue-100    text-blue-600    border-blue-200/50    shadow-blue-500/10',
  emerald: 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 border-emerald-200/50 shadow-emerald-500/10',
  purple:  'bg-gradient-to-br from-purple-50  to-purple-100  text-purple-600  border-purple-200/50  shadow-purple-500/10',
  amber:   'bg-gradient-to-br from-amber-50   to-amber-100   text-amber-600   border-amber-200/50   shadow-amber-500/10',
  pink:    'bg-gradient-to-br from-pink-50    to-pink-100    text-pink-600    border-pink-200/50    shadow-pink-500/10',
  teal:    'bg-gradient-to-br from-teal-50    to-teal-100    text-teal-600    border-teal-200/50    shadow-teal-500/10',
};

const StatCard = ({ label, value, icon, color = 'blue' }) => (
  <div className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-white shadow-xl shadow-slate-200/30 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-200">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner border flex-shrink-0 ${colors[color] || colors.blue}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none">{value}</p>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1 truncate">{label}</p>
    </div>
  </div>
);

export default StatCard;
