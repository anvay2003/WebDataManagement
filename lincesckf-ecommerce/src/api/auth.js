// src/api/auth.js
import { api } from './client';

export async function registerUser(payload) {
  // payload: { email, password, accountType, fullName, companyName }
  const data = await api.post('/auth/register', payload);
  // Persist token
  localStorage.setItem('lincesckf.token', data.token);
  localStorage.setItem('lincesckf.auth', JSON.stringify(data.user));
  return data;
}

export async function loginUser({ email, password }) {
  const data = await api.post('/auth/login', { email, password });
  localStorage.setItem('lincesckf.token', data.token);
  localStorage.setItem('lincesckf.auth', JSON.stringify(data.user));
  return data;
}

export function logoutUser() {
  localStorage.removeItem('lincesckf.token');
  localStorage.removeItem('lincesckf.auth');
}
