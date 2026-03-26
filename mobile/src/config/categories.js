export const CATEGORIES = [
  { value: 'Healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'Beauty', label: 'Beauty', icon: '💇' },
  { value: 'Fitness', label: 'Fitness', icon: '💪' },
  { value: 'Education', label: 'Education', icon: '📚' },
  { value: 'Automotive', label: 'Automotive', icon: '🚗' },
  { value: 'Home', label: 'Home Services', icon: '🏠' },
  { value: 'Professional', label: 'Professional', icon: '💼' },
  { value: 'Other', label: 'Other', icon: '📌' },
];

export const getCategoryIcon = (category) => {
  const icons = {
    'Healthcare': '🏥',
    'Beauty': '💇',
    'Fitness': '💪',
    'Education': '📚',
    'Automotive': '🚗',
    'Home': '🏠',
    'Professional': '💼',
    'Other': '📌'
  };
  return icons[category] || '📌';
};

export const getStaffLabel = (role) => {
  const labels = {
    'VETERINARIAN': 'Veterinarian',
    'GROOMER': 'Pet Groomer',
    'TRAINER': 'Pet Trainer',
    'STYLIST': 'Hair Stylist',
    'THERAPIST': 'Therapist',
    'TRAINER': 'Trainer',
    'MECHANIC': 'Mechanic',
    'TECHNICIAN': 'Technician',
    'CONSULTANT': 'Consultant',
    'SPECIALIST': 'Specialist'
  };
  return labels[role] || role;
};

export const getServiceLabel = (service) => {
  return service?.name || 'Service';
};
