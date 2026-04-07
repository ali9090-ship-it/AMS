const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001';

function getToken() {
  try {
    const auth = localStorage.getItem('ams_auth');
    if (!auth) return null;
    const parsed = JSON.parse(auth);
    // Support both formats: {access_token: "..."} and {token: "..."}
    const token = parsed.access_token || parsed.token;
    if (!token) {
      localStorage.removeItem('ams_auth');
      return null;
    }
    return token;
  } catch (e) {
    localStorage.removeItem('ams_auth');
    return null;
  }
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || 'Something went wrong');
  }
  const json = await res.json();
  // Auto-extract .data from ApiResponse wrapper if present
  return json.data !== undefined ? json.data : json;
}

export async function apiUpload(path: string, formData: FormData) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || 'Upload failed');
  }
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export function getFileUrl(relativePath: string) {
  if (!relativePath) return '';
  if (relativePath.startsWith('http')) return relativePath;
  return `${BASE_URL}/${relativePath}`;
}
