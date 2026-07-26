import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('healthify_token');  
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('healthify_token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/me', data),
  logMood: (data) => api.post('/auth/mood', data),
  getMoodLog: () => api.get('/auth/mood'),
};

export const therapistsAPI = {
  list: (params) => api.get('/therapists', { params }),
  get: (id) => api.get(`/therapists/${id}`),
  getSlots: (id, date) => api.get(`/therapists/${id}/slots`, { params: { date } }),
};

export const sessionsAPI = {
  create: (data) => api.post('/sessions', data),
  list: (params) => api.get('/sessions', { params }),
  get: (id) => api.get(`/sessions/${id}`),
  updateStatus: (id, data) => api.patch(`/sessions/${id}`, data),
  saveNotes: (id, notes) => api.patch(`/sessions/${id}/notes`, { notes }),
  rate: (id, data) => api.post(`/sessions/${id}/rating`, data),
};

export const aiAPI = {
  chat: (messages) => api.post('/ai/chat', { messages }),
};

export const analyserAPI = {
  analyse: (answers) => api.post('/analyser/analyse', answers),
};

const portalApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

export const therapistPortalAPI = {
  login: (email, password) => portalApi.post('/therapist-portal/login', { email, password }),
  listTherapists: (portalToken) =>
    portalApi.get('/therapist-portal/therapists', { headers: { Authorization: `Bearer ${portalToken}` } }),
  unlock: (portalToken, id, pin) =>
    portalApi.post(`/therapist-portal/therapists/${id}/unlock`, { pin }, { headers: { Authorization: `Bearer ${portalToken}` } }),
  getTherapist: (unlockToken, id) =>
    portalApi.get(`/therapist-portal/therapists/${id}`, { headers: { Authorization: `Bearer ${unlockToken}` } }),
  updateTherapist: (unlockToken, id, data) =>
    portalApi.put(`/therapist-portal/therapists/${id}`, data, { headers: { Authorization: `Bearer ${unlockToken}` } }),
};

export default api;
