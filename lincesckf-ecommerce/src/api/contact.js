// src/api/contact.js
import { api } from './client';

export const sendContactMessage = (body) => api.post('/contact', body);
