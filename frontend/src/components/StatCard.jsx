const colors = { blue:'bg-blue-50 text-blue-700', emerald:'bg-emerald-50 text-emerald-700', purple:'bg-purple-50 text-purple-700', amber:'bg-amber-50 text-amber-700', pink:'bg-pink-50 text-pink-700', teal:'bg-teal-50 text-teal-700' };
const StatCard = ({ label, value, icon, color = 'blue' }) => (
  <div className="card flex items-center gap-4">
    <div className={'w-12 h-12 rounded-xl flex items-center justify-center text-2xl ' + (colors[color] || colors.blue)}>{icon}</div>
    <div><p className="text-2xl font-bold text-slate-900">{value}</p><p className="text-sm text-slate-500">{label}</p></div>
  </div>
);
export default StatCard;
