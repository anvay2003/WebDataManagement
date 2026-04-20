// src/api/users.js
import { api } from './client';

export const fetchMe              = ()       => api.get('/users/me');
export const updateMe             = (body)   => api.patch('/users/me', body);
export const changePassword       = (body)   => api.post('/users/me/change-password', body);
export const fetchNotifPrefs      = ()       => api.get('/users/me/notifications');
export const updateNotifPrefs     = (body)   => api.patch('/users/me/notifications', body);
export const fetchMyOrders        = ()       => api.get('/users/me/orders');
export const fetchAllUsers        = ()       => api.get('/users');
