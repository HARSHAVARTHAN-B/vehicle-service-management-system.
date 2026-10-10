import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('autocare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global 401 unauthorized errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('autocare_token');
      localStorage.removeItem('autocare_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || 'Server connection error. Please try again.';
    const errors = error.response?.data?.errors || null;
    return Promise.reject({ message, errors, originalError: error });
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile')
};

export const dashboardAPI = {
  getDashboardData: () => api.get('/dashboard')
};

export const customerAPI = {
  getCustomers: (params) => api.get('/customers', { params }),
  getCustomerById: (id) => api.get(`/customers/${id}`),
  createCustomer: (data) => api.post('/customers', data),
  updateCustomer: (id, data) => api.put(`/customers/${id}`, data),
  deleteCustomer: (id) => api.delete(`/customers/${id}`)
};

export const vehicleAPI = {
  getVehicles: (params) => api.get('/vehicles', { params }),
  getVehiclesByCustomer: (customerId) => api.get(`/vehicles/customer/${customerId}`),
  getVehicleById: (id) => api.get(`/vehicles/${id}`),
  createVehicle: (data) => api.post('/vehicles', data),
  updateVehicle: (id, data) => api.put(`/vehicles/${id}`, data),
  deleteVehicle: (id) => api.delete(`/vehicles/${id}`)
};

export const mechanicAPI = {
  getMechanics: (params) => api.get('/mechanics', { params }),
  getAvailableMechanics: () => api.get('/mechanics/available'),
  getMechanicById: (id) => api.get(`/mechanics/${id}`),
  createMechanic: (data) => api.post('/mechanics', data),
  updateMechanic: (id, data) => api.put(`/mechanics/${id}`, data),
  deleteMechanic: (id) => api.delete(`/mechanics/${id}`)
};

export const bookingAPI = {
  getBookings: (params) => api.get('/bookings', { params }),
  getTodayBookings: () => api.get('/bookings/today'),
  getUpcomingBookings: () => api.get('/bookings/upcoming'),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  createBooking: (data) => api.post('/bookings', data),
  updateBooking: (id, data) => api.put(`/bookings/${id}`, data),
  updateBookingStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  deleteBooking: (id) => api.delete(`/bookings/${id}`)
};

export const serviceAPI = {
  getServices: (params) => api.get('/services', { params }),
  getServiceById: (id) => api.get(`/services/${id}`),
  createService: (data) => api.post('/services', data),
  updateService: (id, data) => api.put(`/services/${id}`, data),
  deleteService: (id) => api.delete(`/services/${id}`)
};

export const paymentAPI = {
  getPayments: (params) => api.get('/payments', { params }),
  getPaymentById: (id) => api.get(`/payments/${id}`),
  createPayment: (data) => api.post('/payments', data),
  updatePayment: (id, data) => api.put(`/payments/${id}`, data),
  deletePayment: (id) => api.delete(`/payments/${id}`)
};

export const reportAPI = {
  getRevenueReport: (params) => api.get('/reports/revenue', { params }),
  getBookingsReport: (params) => api.get('/reports/bookings', { params }),
  getServicesReport: (params) => api.get('/reports/services', { params }),
  getMechanicsReport: (params) => api.get('/reports/mechanics', { params }),
  getCustomersReport: (params) => api.get('/reports/customers', { params })
};

export default api;
