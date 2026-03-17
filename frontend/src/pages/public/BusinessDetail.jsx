import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { businessAPI, appointmentsAPI } from '../../api';
import { useAuth } from '../../routes/AuthContext';
import { getCategoryIcon, getStaffLabel, getServiceLabel } from '../../config/categories';

const STEPS = ['Select Service', 'Select Staff', 'Pick Date & Time', 'Confirm'];
const TIME_SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];

const Row = ({ label, value }) => (
  <div className="flex justify-between py-2 xs:py-1.5 border-b border-slate-50 last:border-0">
    <span className="text-sm text-slate-500 xs:text-xs">{label}</span>
    <span className="text-sm font-medium text-slate-900 xs:text-xs">{value}</span>
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
        <div className="max-w-lg mx-auto text-center px-4 xs:px-2">
          <div className="w-20 h-20 xs:w-16 xs:h-16 bg-emerald-100 rounded-full flex items-center justify-center text-4xl xs:text-3xl mx-auto mb-6 xs:mb-4">✓</div>
          <h1 className="text-2xl xs:text-xl font-bold text-slate-900 mb-2">Appointment Confirmed!</h1>
          <p className="text-slate-500 xs:text-sm mb-8 xs:mb-6">Booked at <strong>{business.name}</strong></p>
          <div className="card text-left mb-8 xs:mb-6">
            <Row label="Business"      value={business.name} />
            <Row label={serviceLabel}  value={confirmed.service?.name} />
            <Row label={staffLabel}    value={confirmed.staff?.name} />
            <Row label="Date"          value={confirmed.appointment_date} />
            <Row label="Time"          value={confirmed.appointment_time?.slice(0,5)} />
            <Row label="Price"         value={currency + parseFloat(confirmed.service?.price || 0).toFixed(2)} />
          </div>
          <div className="flex gap-3 justify-center flex-col xs:flex-row">
            <button className="btn-primary" onClick={reset}>Book Another</button>
            <button className="btn-secondary" onClick={() => navigate('/my-appointments')}>My Appointments</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <button className="text-sm text-primary-600 hover:underline mb-4 xs:mb-3" onClick={() => navigate('/businesses')}>← Back to Businesses</button>

      {/* Business info */}
      <div className="card mb-6 xs:mb-4">
        <div className="flex items-start gap-4 xs:gap-3">
          <div className="w-16 h-16 xs:w-12 xs:h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-4xl xs:text-2xl">{catIcon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl xs:text-lg font-bold text-slate-900">{business.name}</h1>
              <span className="text-xs bg-primary-100 text-primary-700 px-2.5 py-1 xs:px-2 xs:py-0.5 rounded-full font-medium">{business.category}</span>
            </div>
            {business.speciality && <p className="text-primary-600 font-medium text-sm xs:text-xs mt-0.5">{business.speciality}</p>}
            {business.address && <p className="text-slate-500 text-sm xs:text-xs mt-1">📍 {business.address}</p>}
            {business.phone && <p className="text-slate-500 text-sm xs:text-xs">📞 {business.phone}</p>}
            {business.description && <p className="text-slate-600 text-sm xs:text-xs mt-2">{business.description}</p>}
          </div>
        </div>
      </div>

      <h2 className="text-lg xs:text-base font-semibold text-slate-800 mb-4 xs:mb-3">Book an Appointment</h2>

      {/* Stepper */}
      <div className="flex items-center mb-6 flex-wrap gap-y-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center">
            <div className={'flex items-center gap-2 ' + (i <= step ? 'text-primary-600' : 'text-slate-400')}>
              <div className={'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ' +
                (i < step ? 'bg-primary-600 border-primary-600 text-white' : i === step ? 'border-primary-600 text-primary-600' : 'border-slate-300 text-slate-400')}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className="text-sm font-medium hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={'h-0.5 mx-3 ' + (i < step ? 'bg-primary-600' : 'bg-slate-200')} style={{ width: 32 }} />}
          </div>
        ))}
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      <div className="max-w-xl">
        {/* Step 0: Service */}
        {step === 0 && (
          <div>
            <h3 className="font-semibold text-slate-700 mb-3">Choose a {serviceLabel}</h3>
            {!(business.services?.length) ? <p className="text-slate-400 text-sm">No services available yet.</p> : (
              <div className="grid gap-3">
                {business.services.map(s => (
                  <button key={s.id} onClick={() => { setSelected({ ...selected, service: s }); setStep(1); }}
                    className={'text-left p-4 rounded-xl border-2 transition-all hover:border-primary-400 hover:bg-primary-50 ' + (selected.service?.id === s.id ? 'border-primary-600 bg-primary-50' : 'border-slate-200 bg-white')}>
                    <div className="flex justify-between items-center">
                      <div><p className="font-semibold text-slate-900">{s.name}</p><p className="text-sm text-slate-500">{s.duration_minutes} min</p></div>
                      <p className="text-lg font-bold text-primary-600">{currency}{parseFloat(s.price).toFixed(2)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 1: Staff */}
        {step === 1 && (
          <div>
            <h3 className="font-semibold text-slate-700 mb-3">Choose a {staffLabel}</h3>
            {!(business.staff?.length) ? <p className="text-slate-400 text-sm">No staff available yet.</p> : (
              <div className="grid gap-3">
                {business.staff.map(s => (
                  <button key={s.id} onClick={() => { setSelected({ ...selected, staff: s }); setStep(2); }}
                    className={'text-left p-4 rounded-xl border-2 transition-all hover:border-primary-400 hover:bg-primary-50 ' + (selected.staff?.id === s.id ? 'border-primary-600 bg-primary-50' : 'border-slate-200 bg-white')}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg">{s.name?.[0]?.toUpperCase()}</div>
                      <div><p className="font-semibold text-slate-900">{s.name}</p><p className="text-sm text-slate-500">{s.specialization || staffLabel}</p></div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <button className="btn-secondary mt-4" onClick={() => setStep(0)}>← Back</button>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div>
            <h3 className="font-semibold text-slate-700 mb-3">Pick Date & Time</h3>
            <div className="card mb-4">
              <label className="label">Date</label>
              <input type="date" className="input" min={today} value={selected.date} onChange={e => setSelected({ ...selected, date: e.target.value, time: '' })} />
            </div>
            {selected.date && (
              <div className="card">
                <label className="label mb-3">Available Times</label>
                {loadingSlots ? (
                  <div className="text-slate-400 text-sm">Loading available slots...</div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {slotAvailability.allSlots.map(t => {
                      const isBooked = slotAvailability.bookedSlots.includes(t);
                      const isSelected = selected.time === t;
                      
                      return (
                        <button
                          key={t}
                          onClick={() => !isBooked && setSelected({ ...selected, time: t })}
                          disabled={isBooked}
                          className={
                            'py-2 px-3 rounded-lg text-sm font-medium border-2 transition-all ' +
                            (isBooked 
                              ? 'border-red-200 bg-red-50 text-red-500 cursor-not-allowed opacity-60' 
                              : isSelected 
                                ? 'border-primary-600 bg-primary-600 text-white' 
                                : 'border-slate-200 hover:border-primary-400 text-slate-700'
                            )
                          }
                        >
                          {isBooked ? 'Booked' : t}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button className="btn-secondary" onClick={() => setStep(1)}>← Back</button>
              <button className="btn-primary" disabled={!selected.date || !selected.time}
                onClick={() => { if (!user) { navigate('/login'); return; } setStep(3); }}>Next →</button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div>
            <h3 className="font-semibold text-slate-700 mb-3">Confirm Booking</h3>
            <div className="card mb-6">
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
            <div className="flex gap-3">
              <button className="btn-secondary" onClick={() => setStep(2)}>← Back</button>
              <button className="btn-primary flex-1" onClick={handleConfirm} disabled={submitting}>{submitting ? 'Booking…' : 'Confirm Booking'}</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
export default BusinessDetail;
