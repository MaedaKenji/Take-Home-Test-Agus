import api from './api';

export const getMedicines = (params) => api.get('/medicines', { params });
export const getLowStockMedicines = () => api.get('/medicines/low-stock');
export const getMedicineById = (id) => api.get(`/medicines/${id}`);
export const createMedicine = (data) => api.post('/medicines', data);
export const updateMedicine = (id, data) => api.put(`/medicines/${id}`, data);
export const deleteMedicine = (id) => api.delete(`/medicines/${id}`);
