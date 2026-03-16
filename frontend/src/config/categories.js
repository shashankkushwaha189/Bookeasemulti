// Central config — all business categories, icons, and dynamic labels
// To add a new category just add one entry here. Nothing else needs to change.

export const CATEGORIES = [
  { value: 'Healthcare',     label: 'Healthcare',     icon: '🏥', staffLabel: 'Doctor',          serviceLabel: 'Treatment',   color: 'blue' },
  { value: 'Dental',         label: 'Dental',         icon: '🦷', staffLabel: 'Dentist',         serviceLabel: 'Treatment',   color: 'sky' },
  { value: 'Salon',          label: 'Salon',          icon: '💇', staffLabel: 'Stylist',         serviceLabel: 'Service',     color: 'pink' },
  { value: 'Spa',            label: 'Spa',            icon: '💆', staffLabel: 'Therapist',       serviceLabel: 'Treatment',   color: 'purple' },
  { value: 'Fitness',        label: 'Fitness',        icon: '🏋️', staffLabel: 'Trainer',         serviceLabel: 'Session',     color: 'orange' },
  { value: 'Veterinary',     label: 'Veterinary',     icon: '🐾', staffLabel: 'Vet',             serviceLabel: 'Treatment',   color: 'emerald' },
  { value: 'Physiotherapy',  label: 'Physiotherapy',  icon: '🦴', staffLabel: 'Physiotherapist', serviceLabel: 'Session',     color: 'teal' },
  { value: 'Legal',          label: 'Legal',          icon: '⚖️', staffLabel: 'Lawyer',          serviceLabel: 'Consultation',color: 'slate' },
  { value: 'Coaching',       label: 'Coaching',       icon: '📚', staffLabel: 'Coach',           serviceLabel: 'Session',     color: 'yellow' },
  { value: 'Other',          label: 'Other',          icon: '🏢', staffLabel: 'Staff',           serviceLabel: 'Service',     color: 'gray' },
];

export const getCategoryConfig = (categoryValue) =>
  CATEGORIES.find(c => c.value === categoryValue) || CATEGORIES[CATEGORIES.length - 1];

export const getCategoryIcon  = (cat) => getCategoryConfig(cat).icon;
export const getStaffLabel    = (cat) => getCategoryConfig(cat).staffLabel;
export const getServiceLabel  = (cat) => getCategoryConfig(cat).serviceLabel;
