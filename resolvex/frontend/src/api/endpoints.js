import api from './axios';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
  updatePassword: (data) => api.put('/auth/update-password', data),
};

export const userApi = {
  updateProfile: (data) => api.put('/users/profile', data),
  updateAvatar: (formData) =>
    api.put('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  list: (params) => api.get('/users', { params }),
  get: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  remove: (id) => api.delete(`/users/${id}`),
  departmentStaff: (departmentId) => api.get(`/users/department/${departmentId}/staff`),
};

export const complaintApi = {
  list: (params) => api.get('/complaints', { params }),
  get: (id) => api.get(`/complaints/${id}`),
  create: (formData) =>
    api.post('/complaints', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  assign: (id, data) => api.put(`/complaints/${id}/assign`, data),
  updateStatus: (id, formData) =>
    api.put(`/complaints/${id}/status`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  remove: (id) => api.delete(`/complaints/${id}`),
  myStats: () => api.get('/complaints/my-stats'),
};

export const departmentApi = {
  list: () => api.get('/departments'),
  get: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  remove: (id) => api.delete(`/departments/${id}`),
};

export const feedbackApi = {
  submit: (data) => api.post('/feedback', data),
  list: () => api.get('/feedback'),
  forComplaint: (complaintId) => api.get(`/feedback/complaint/${complaintId}`),
};

export const notificationApi = {
  list: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  remove: (id) => api.delete(`/notifications/${id}`),
  broadcast: (data) => api.post('/notifications/broadcast', data),
};

export const analyticsApi = {
  adminDashboard: () => api.get('/analytics/admin-dashboard'),
  departmentDashboard: () => api.get('/analytics/department-dashboard'),
  exportExcelUrl: () => `${api.defaults.baseURL}/analytics/export/excel`,
  exportPdfUrl: () => `${api.defaults.baseURL}/analytics/export/pdf`,
};

export const adminApi = {
  activityLogs: (params) => api.get('/admin/activity-logs', { params }),
};
