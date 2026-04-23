// ── API helper ───────────────────────────────────────────────────
// All network requests go through this file.
// It handles: auth headers, error parsing, and JSON responses.

// Base URL for all API calls — change this to your backend address
const BASE_URL = 'http://localhost:4000/api/v1'

// Get the saved auth token from localStorage
const getToken = () => localStorage.getItem('token')

// Build headers for authenticated requests
const buildHeaders = () => ({
  'Content-Type': 'application/json',
  // Only add Authorization header if a token exists
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
})

// ── Core request function ────────────────────────────────────────
// Used internally by api.get, api.post, etc.
const request = async (url, options = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      credentials: 'include',
      headers: options.headers || buildHeaders(),
    })

    // If the server returned an error status (4xx, 5xx)
    if (!response.ok) {
      const text = await response.text()
      console.error(`API error [${options.method || 'GET'}] ${url}:`, response.status, text)
      return { success: false, error: `${response.status} ${response.statusText}` }
    }

    // Parse and return the JSON response
    return response.json()

  } catch (err) {
    // Network-level error (no internet, server down, etc.)
    console.error(`Network error [${options.method || 'GET'}] ${url}:`, err.message)
    throw err
  }
}

// ── Public API methods ───────────────────────────────────────────
export const api = {
  // GET request — fetches data from the server
  get: (url) => request(url),

  // POST request — sends data to create something
  post: (url, body) => request(url, {
    method: 'POST',
    body: JSON.stringify(body),
  }),

  // PUT request — sends data to update something
  put: (url, body) => request(url, {
    method: 'PUT',
    body: JSON.stringify(body),
  }),

  // DELETE request — removes something from the server
  delete: (url) => request(url, { method: 'DELETE' }),

  // File upload — uses FormData instead of JSON
  upload: (url, formData) => fetch(`${BASE_URL}${url}`, {
    method: 'POST',
    credentials: 'include',
    body: formData, // no JSON stringify — FormData handles the encoding
  }).then(r => r.json()),
}
