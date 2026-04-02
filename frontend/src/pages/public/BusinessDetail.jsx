import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { businessAPI, appointmentsAPI } from '../../api';
import { useAuth } from '../../routes/AuthContext';
import { getCategoryIcon, getStaffLabel, getServiceLabel } from '../../config/categories';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  BriefcaseIcon,
  ArrowLeftIcon,
  CheckBadgeIcon,
  MapPinIcon,
  PhoneIcon,
  SparklesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';

const STEPS = ['Select Service', 'Select Staff', 'Pick Date & Time', 'Confirm'];
const TIME_SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];

const Row = ({ label, value }) => (
  <div className="flex justify-between py-3 xs:py-2 border-b border-slate-100 last:border-0 items-center">
    <span className="text-sm font-medium text-slate-500 xs:text-xs">{label}</span>
    <span className="text-sm font-bold text-slate-900 xs:text-xs text-right max-w-[60%]">{value}</span>
  </div>
);

const BusinessDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState({ service: null, staff: null, date: '', time: '' });
  const [confirmed, setConfirmed] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [slotAvailability, setSlotAvailability] = useState({ availableSlots: [], bookedSlots: [], allSlots: [] });
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    businessAPI.getById(id).then(r => setBusiness(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (selected.date && selected.staff && selected.service) {
      fetchSlotAvailability();
    } else {
      setSlotAvailability({ availableSlots: [], bookedSlots: [], allSlots: [] });
    }
  }, [selected.date, selected.staff?.id, selected.service?.id]);

  const fetchSlotAvailability = async () => {
    if (!selected.date || !selected.staff?.id || !selected.service?.id) return;
    
    setLoadingSlots(true);
    try {
      const response = await appointmentsAPI.getAvailableSlots({
        business_id: id,
        staff_id: selected.staff.id,
        service_id: selected.service.id,
        date: selected.date
      });
      setSlotAvailability(response.data);
    } catch (err) {
      console.error('Error fetching slot availability:', err);
      setSlotAvailability({ availableSlots: [], bookedSlots: [], allSlots: TIME_SLOTS });
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleConfirm = async () => {
    if (!user) return navigate('/login');
    setSubmitting(true); setError('');
    try {
      const res = await appointmentsAPI.create({
        business_id: parseInt(id),
        service_id: selected.service.id,
        staff_id: selected.staff.id,
        appointment_date: selected.date,
        appointment_time: selected.time + ':00',
      });
      setConfirmed(res.data); setStep(4);
    } catch (err) { setError(err.response?.data?.message || 'Booking failed.'); }
    finally { setSubmitting(false); }
  };

  const reset = () => { setStep(0); setSelected({ service: null, staff: null, date: '', time: '' }); setConfirmed(null); setError(''); };
  const today = new Date().toISOString().split('T')[0];

  if (loading) return <Layout><div className="text-slate-400">Loading…</div></Layout>;
  if (!business) return <Layout><div className="text-red-500">Business not found.</div></Layout>;

  const catIcon = getCategoryIcon(business.category);
  const staffLabel = getStaffLabel(business.category);
  const serviceLabel = getServiceLabel(business.category);
  const currency = business.currency || '₹';

  // Success screen
  if (step === 4 && confirmed) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto text-center px-4 pt-12 pb-8">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border-[6px] border-emerald-50">
            <CheckBadgeIcon className="w-14 h-14 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Appointment Confirmed!</h1>
          <p className="text-slate-500 font-medium mb-8">You're all set with <strong className="text-slate-800">{business.name}</strong></p>
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-xl shadow-slate-200/40 text-left mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10"></div>
            <Row label="Business"      value={business.name} />
            <Row label={serviceLabel}  value={confirmed.service?.name} />
            <Row label={staffLabel}    value={confirmed.staff?.name} />
            <Row label="Date"          value={confirmed.appointment_date} />
            <Row label="Time"          value={confirmed.appointment_time?.slice(0,5)} />
            <Row label="Price"         value={currency + parseFloat(confirmed.service?.price || 0).toFixed(2)} />
          </div>
          <div className="flex gap-3 justify-center flex-col xs:flex-row">
            <button className="flex-1 py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-slate-900/20" onClick={reset}>Book Another</button>
            <button className="flex-1 py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-primary-600/30" onClick={() => navigate('/my-appointments')}>View Appointments</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative mb-6">
        <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-primary-400/10 to-transparent blur-3xl pointer-events-none -z-10"></div>
        <button className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary-600 transition-colors mb-6" onClick={() => navigate('/businesses')}>
          <ArrowLeftIcon className="w-4 h-4" /> Back to Businesses
        </button>

        {/* Business info */}
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-xl shadow-slate-200/30 mb-8 overflow-hidden relative">
          <div className="flex items-start md:items-center gap-5">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl flex items-center justify-center text-5xl shadow-inner border border-primary-100 flex-shrink-0">
              {catIcon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                  {business.name} <ShieldCheckIcon className="w-6 h-6 text-emerald-500" />
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200/50">{business.category}</span>
              </div>
              {business.speciality && <p className="text-primary-600 font-semibold text-sm mb-3">{business.speciality}</p>}
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-slate-500">
                {business.address && (
                  <div className="flex items-start gap-1.5 text-sm font-medium">
                    <MapPinIcon className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
                    <span>{business.address}</span>
                  </div>
                )}
                {business.phone && (
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <PhoneIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{business.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {business.description && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <p className="text-slate-600 text-sm leading-relaxed">{business.description}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-6">
          <CalendarDaysIcon className="w-6 h-6 text-primary-500" />
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Book an Appointment</h2>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-6 overflow-x-auto scrollbar-hide">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center px-2">
              <div className={'flex items-center gap-2.5 ' + (i <= step ? 'text-primary-600' : 'text-slate-400')}>
                <div className={'w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold border-2 transition-all shadow-sm ' +
                  (i < step ? 'bg-primary-600 border-primary-600 text-white shadow-primary-600/30' : i === step ? 'border-primary-600 bg-primary-50 text-primary-600' : 'border-slate-200 bg-white text-slate-400')}>
                  {i < step ? <CheckCircleIcon className="w-5 h-5"/> : i + 1}
                </div>
                <span className={`text-sm ${i === step ? 'font-bold' : 'font-semibold'} whitespace-nowrap hidden sm:block`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={'h-0.5 mx-3 sm:mx-4 rounded-full ' + (i < step ? 'bg-primary-600' : 'bg-slate-200')} style={{ width: 40 }} />}
            </div>
          ))}
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
      <div className="max-w-xl">
        {/* Step 0: Service */}
        {step === 0 && (
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-xl shadow-slate-200/30">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><BriefcaseIcon className="w-5 h-5 text-primary-500"/> Choose a {serviceLabel}</h3>
            {!(business.services?.length) ? <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">No services available yet.</div> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {business.services.map(s => (
                  <button key={s.id} onClick={() => { setSelected({ ...selected, service: s }); setStep(1); }}
                    className={'text-left p-5 rounded-2xl border-2 transition-all hover:shadow-md hover:-translate-y-0.5 ' + (selected.service?.id === s.id ? 'border-primary-600 bg-primary-50 shadow-primary-600/10' : 'border-slate-100 bg-white hover:border-primary-300 hover:bg-slate-50')}>
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-slate-900 text-lg leading-tight">{s.name}</p>
                      <p className="text-lg font-extrabold text-primary-600 bg-primary-100/50 px-2 py-0.5 rounded-lg">{currency}{parseFloat(s.price).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                      <ClockIcon className="w-4 h-4" /> {s.duration_minutes} min
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 1: Staff */}
        {step === 1 && (
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-xl shadow-slate-200/30">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><UserIcon className="w-5 h-5 text-primary-500"/> Choose a {staffLabel}</h3>
            {!(business.staff?.length) ? <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">No staff available yet.</div> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {business.staff.map(s => (
                  <button key={s.id} onClick={() => { setSelected({ ...selected, staff: s }); setStep(2); }}
                    className={'text-left p-4 rounded-2xl border-2 transition-all hover:shadow-md hover:-translate-y-0.5 ' + (selected.staff?.id === s.id ? 'border-primary-600 bg-primary-50 shadow-primary-600/10' : 'border-slate-100 bg-white hover:border-primary-300 hover:bg-slate-50')}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 flex items-center justify-center font-extrabold text-xl shadow-inner border border-primary-200/50">{s.name?.[0]?.toUpperCase()}</div>
                      <div>
                        <p className="font-bold text-slate-900">{s.name}</p>
                        <p className="text-xs font-semibold text-primary-600 mt-0.5 uppercase tracking-wider">{s.specialization || staffLabel}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="mt-6 border-t border-slate-100 pt-6">
              <button className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors" onClick={() => setStep(0)}>← Back to Services</button>
            </div>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-xl shadow-slate-200/30">
            <h3 className="font-bold text-lg text-slate-800 mb-5 flex items-center gap-2"><CalendarDaysIcon className="w-5 h-5 text-primary-500"/> Pick Date & Time</h3>
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Select Date</label>
              <div className="relative">
                <input type="date" className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-slate-800" min={today} value={selected.date} onChange={e => setSelected({ ...selected, date: e.target.value, time: '' })} />
                <CalendarDaysIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>
            {selected.date && (
              <div className="mb-2">
                <label className="block text-sm font-bold text-slate-700 mb-3">Available Times</label>
                {loadingSlots ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                    {slotAvailability.allSlots.map(t => {
                      const isBooked = slotAvailability.bookedSlots.includes(t);
                      const isSelected = selected.time === t;
                      
                      return (
                        <button
                          key={t}
                          onClick={() => !isBooked && setSelected({ ...selected, time: t })}
                          disabled={isBooked}
                          className={
                            'py-2.5 px-3 rounded-xl text-sm font-bold border-2 transition-all ' +
                            (isBooked 
                              ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed' 
                              : isSelected 
                                ? 'border-primary-600 bg-primary-600 text-white shadow-md shadow-primary-600/30 -translate-y-0.5' 
                                : 'border-slate-200 bg-white hover:border-primary-400 hover:bg-primary-50 text-slate-700 hover:-translate-y-0.5'
                            )
                          }
                        >
                          {isBooked ? 'Full' : t}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8 border-t border-slate-100 pt-6">
              <button className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors" onClick={() => setStep(1)}>← Back</button>
              <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl text-sm transition-all sm:ml-auto shadow-md shadow-primary-600/20 disabled:shadow-none" disabled={!selected.date || !selected.time}
                onClick={() => { if (!user) { navigate('/login'); return; } setStep(3); }}>Continue to Confirm →</button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-xl shadow-slate-200/30">
            <h3 className="font-bold text-xl text-slate-800 mb-6 flex items-center gap-2"><SparklesIcon className="w-6 h-6 text-primary-500"/> Confirm Booking</h3>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6">
              <Row label="Business"        value={business.name} />
              <Row label="Category"        value={business.category} />
              <Row label={serviceLabel}    value={selected.service?.name} />
              <Row label="Duration"        value={selected.service?.duration_minutes + ' min'} />
              <Row label="Price"           value={currency + parseFloat(selected.service?.price || 0).toFixed(2)} />
              <Row label={staffLabel}      value={selected.staff?.name} />
              <Row label="Specialization"  value={selected.staff?.specialization || staffLabel} />
              <Row label="Date"            value={selected.date} />
              <Row label="Time"            value={selected.time} />
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors" onClick={() => setStep(2)}>← Edit Details</button>
              <button className="px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold rounded-xl text-sm transition-all flex-1 shadow-xl shadow-slate-900/20 flex justify-center items-center gap-2" onClick={handleConfirm} disabled={submitting}>
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
export default BusinessDetail;
