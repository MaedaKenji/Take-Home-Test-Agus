import api from './api';

export const getOrders = (params) => api.get('/orders', { params });
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const createOrder = (data) => api.post('/orders', data);
export const updateOrder = (id, data) => api.put(`/orders/${id}`, data);
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status });
export const updateOrderItems = (id, items) => api.patch(`/orders/${id}/items`, { items });
export const deleteOrder = (id) => api.delete(`/orders/${id}`);
export const getDashboardStats = () => api.get('/dashboard/stats');
