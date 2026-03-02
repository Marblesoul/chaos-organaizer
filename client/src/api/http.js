// In production BACKEND_URL is injected by webpack DefinePlugin (e.g. https://my-app.herokuapp.com)
// In dev it's empty and requests go to the webpack-dev-server proxy
const BASE = (process.env.BACKEND_URL || '') + '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export function getMessages(limit = 10, beforeId = null) {
  const params = new URLSearchParams({ limit });
  if (beforeId) params.set('before', beforeId);
  return request(`/messages?${params}`);
}

export function postMessage(content) {
  return request('/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
}

export function searchMessages(q) {
  const params = new URLSearchParams({ q });
  return request(`/search?${params}`);
}

export function uploadFile(formData) {
  return request('/files', { method: 'POST', body: formData });
}

export function getPins() {
  return request('/pins');
}

export function pinMessage(id) {
  return request(`/pins/${id}`, { method: 'POST' });
}

export function unpinMessage(id) {
  return request(`/pins/${id}`, { method: 'DELETE' });
}
