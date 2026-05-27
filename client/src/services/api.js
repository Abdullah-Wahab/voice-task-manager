const API_URL = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  getTasks: () => request('/api/tasks'),

  chat: (transcript, conversationHistory = []) =>
    request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        transcript,
        conversation_history: conversationHistory,
      }),
    }),

  health: () => request('/api/health'),
};
