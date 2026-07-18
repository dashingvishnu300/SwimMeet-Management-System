import axios from 'axios';

const BASE_URL =
  process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto refresh token if expired
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        const res = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
          refresh,
        });
        localStorage.setItem('access_token', res.data.access);
        original.headers.Authorization = `Bearer ${res.data.access}`;
        return api(original);
      } catch (err) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── AUTH ─────────────────────────────────────────────────
export const authAPI = {
  register: (data) =>
    api.post(
      '/users/register/',
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    ),
  login: (data) => api.post('/auth/login/', data),
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
  changePassword: (data) =>
    api.post(
      '/auth/change-password/',
      data
    ),
  getProfile: () => api.get('/auth/me/'),
  updateProfile: (data) => api.patch('/auth/me/', data),
};


// ── USERS ─────────────────────────────────────────────
export const usersAPI = {
  getSwimmers: () => api.get('/users/swimmers/'),
  getUserById: (id) =>
    api.get(`/users/profile/${id}/`),
  getQualifiedSwimmers: (level, eventId) =>
    api.get(
        `/users/qualified-swimmers/?level=${level}&event_id=${eventId}`
    ),
};

// ── MEETS ────────────────────────────────────────────────
export const meetsAPI = {
  getAll: () => api.get('/meets/'),
  getOne: (id) => api.get(`/meets/${id}/`),
  publishResults: (id) =>
    api.post(`/meets/${id}/publish/`),
  
  unpublishResults: (id) =>
    api.post(`/meets/${id}/unpublish/`),
  create: (data) => api.post('/meets/', data),
  update: (id, data) => api.patch(`/meets/${id}/`, data),
  delete: (id) =>
    api.delete(`/meets/${id}/`),
  action: (id, action) => api.post(`/meets/${id}/action/${action}/`),
  getDocuments: (id) => api.get(`/meets/${id}/documents/`),
  uploadDocument: (id, formData) => api.post(`/meets/${id}/documents/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// ── EVENTS ───────────────────────────────────────────────
export const eventsAPI = {
  getMasterList: (params) => api.get('/events/master/', { params }),
  getMeetEvents: (meetId) => api.get(`/events/meets/${meetId}/`),
  getEligibleEvents: (meetId) =>
    api.get(`/events/meets/${meetId}/eligible-events/`),
  assignEvents: (meetId, data) => api.post(`/events/meets/${meetId}/`, data),
  deleteEvent: (meetId, eventId) => api.delete(`/events/meets/${meetId}/${eventId}/`),
};

// ── REGISTRATIONS ────────────────────────────────────────
export const registrationsAPI = {
  getAll: (meetId) => api.get(`/registrations/meets/${meetId}/`),
  register: (meetId, data) => api.post(`/registrations/meets/${meetId}/`, data),
  recall: (meetId, regId) => api.post(`/registrations/meets/${meetId}/${regId}/recall/`),
  sendBack: (meetId, regId) => api.post(`/registrations/meets/${meetId}/${regId}/send-back/`),
  myRegistrations: () => api.get('/registrations/my/'),
  bestTimes: (swimmerId) => api.get(`/registrations/swimmers/${swimmerId}/best-times/`),
};

// ── HEATS ────────────────────────────────────────────────
export const heatsAPI = {
  generate: (meetId, eventId) => api.post(`/heats/meets/${meetId}/events/${eventId}/generate/`),
  getHeats: (meetId, eventId) => api.get(`/heats/meets/${meetId}/events/${eventId}/`),
  enterResults: (heatId, data) => api.post(`/heats/${heatId}/results/`, data),
  completeHeat: (heatId) => api.post(`/heats/${heatId}/complete/`),
};

// ── RESULTS ──────────────────────────────────────────────
export const resultsAPI = {

  generateFinals: (meetId, eventId) =>
    api.post(`/results/meets/${meetId}/events/${eventId}/generate-finals/`),

  generateAllFinals: (meetId) =>
    api.post(`/results/generate-all-finals/${meetId}/`),

  getFinals: (meetId, eventId) =>
    api.get(`/results/meets/${meetId}/events/${eventId}/finals/`),

  enterFinalResults: (finalId, data) =>
    api.post(`/results/finals/${finalId}/results/`, data),

  getMeetResults: (meetId) =>
    api.get(`/results/meets/${meetId}/`),
};

// ── CHAMPIONSHIPS ────────────────────────────────────────
export const championshipsAPI = {
  calculatePoints: (meetId) => api.post(`/championships/meets/${meetId}/calculate/`),
  getMedalTally: (meetId) => api.get(`/championships/meets/${meetId}/tally/`),
  getPodium: (meetId) => api.get(`/championships/meets/${meetId}/podium/`),
  getRecords: (params) => api.get('/championships/records/', { params }),
  getMeetRecords: (meetId) => api.get(`/championships/meets/${meetId}/records/`),
  getSwimmerChampionships: (swimmerId) => api.get(`/championships/swimmers/${swimmerId}/`),
  getSwimmerDashboard: () => api.get('/championships/dashboard/'),
};

export const userAPI = {

  getProfileStats: () =>
    api.get('/users/profile-stats/'),

  getPersonalBests: () =>
    api.get('/users/personal-bests/'),

  getRecentResults: () =>
    api.get('/users/recent-results/'),

  getRecordsHeld: () =>
    api.get('/users/records-held/'),

  getMeetHistory: () =>
    api.get('/users/meet-history/'),

  getRegisteredEvents: () =>
    api.get('/users/registered-events/'),

  getProfileStatsById: (id) =>
    api.get(`/users/profile-stats/${id}/`),
  
  getPersonalBestsById: (id) =>
    api.get(`/users/personal-bests/${id}/`),
  
  getRecentResultsById: (id) =>
    api.get(`/users/recent-results/${id}/`),
  
  getRecordsHeldById: (id) =>
    api.get(`/users/records-held/${id}/`),
  
  getMeetHistoryById: (id) =>
    api.get(`/users/meet-history/${id}/`),
  
  getRegisteredEventsById: (id) =>
    api.get(`/users/registered-events/${id}/`),

  getUserById: (id) =>
    api.get(`/users/profile/${id}/`),
};

  export const adminAPI = {

    getPendingOrganizers: () =>
      api.get('/auth/admin/pending-organizers/'),
  
    getApprovedOrganizers: () =>
      api.get('/auth/admin/approved-organizers/'),
  
    getRejectedOrganizers: () =>
      api.get('/auth/admin/rejected-organizers/'),
  
    approveOrganizer: (id) =>
      api.post(`/auth/admin/organizers/${id}/approve/`),
  
    rejectOrganizer: (id, reason) =>
      api.post(
        `/auth/admin/organizers/${id}/reject/`,
        {
          reason
        }
      ),
  
  };

  export const mastersAPI = {

    states: () =>
      api.get(
        '/masters/states/'
      ),
  
    districts: (stateId) =>
      api.get(
        `/masters/states/${stateId}/districts/`
      ),
  
    associations: (districtId) =>
      api.get(
        `/masters/districts/${districtId}/associations/`
      ),
      stateAssociations: (stateId) =>
        api.get(
          `/masters/states/${stateId}/associations/`
        ),
  
  };
  export const certificatesAPI = {

    getMyCertificates() {
        return api.get("/certificates/my-certificates/");
    },

    downloadParticipation(id) {
        return api.get(
            `/certificates/participation-pro/${id}/`,
            {
                responseType: "blob",
            }
        );
    },

    downloadGold(id) {
        return api.get(
            `/certificates/gold/${id}/`,
            {
                responseType: "blob",
            }
        );
    },

    downloadSilver(id) {
        return api.get(
            `/certificates/silver/${id}/`,
            {
                responseType: "blob",
            }
        );
    },

    downloadBronze(id) {
        return api.get(
            `/certificates/bronze/${id}/`,
            {
                responseType: "blob",
            }
        );
    }

};

export default api;