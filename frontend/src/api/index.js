import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  getMe:    ()     => api.get('/auth/me'),
};

export const businessAPI = {
  getAll:     ()         => api.get('/businesses'),
  getAllAdmin: ()         => api.get('/businesses/admin/all'),
  getById:    (id)       => api.get('/businesses/' + id),
  getServices:(id)       => api.get('/businesses/' + id + '/services'),
  getStaff:   (id)       => api.get('/businesses/' + id + '/staff'),
  create:     (data)     => api.post('/businesses', data),
  update:     (id, data) => api.put('/businesses/' + id, data),
  delete:     (id)       => api.delete('/businesses/' + id),
};

export const servicesAPI = {
  getAll:  ()         => api.get('/services'),
  create:  (data)     => api.post('/services', data),
  update:  (id, data) => api.put('/services/' + id, data),
  delete:  (id)       => api.delete('/services/' + id),
};

export const staffAPI = {
  getAll:             ()         => api.get('/staff'),
  create:             (data)     => api.post('/staff', data),
  update:             (id, data) => api.put('/staff/' + id, data),
  delete:             (id)       => api.delete('/staff/' + id),
  getMyAppointments:  ()         => api.get('/staff/my-appointments'),
};

export const appointmentsAPI = {
  getAll:     ()         => api.get('/appointments/all'),
  getBusiness:()         => api.get('/appointments/business'),
  getMy:      ()         => api.get('/appointments/my'),
  getAvailableSlots: (params) => api.get('/appointments/available-slots', { params }),
  create:     (data)     => api.post('/appointments', data),
  update:     (id, data) => api.put('/appointments/' + id, data),
};

export const superAdminAPI = {
  getStats: () => api.get('/super-admin/stats'),
  getUsers: () => api.get('/super-admin/users'),
};

export default api;
