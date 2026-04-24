const BASE_URL = 'https://watttrack-backend.onrender.com'

const getToken = () => localStorage.getItem('token')

const buildHeaders = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
})

const request = async (url, options = {}) => {
  try {
    const response = await fetch(`${BASE_URL}/${url}`, {
      ...options,
      headers: buildHeaders(),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error(`API error [${options.method || 'GET'}] ${url}:`, response.status, text)
      return { success: false, error: `${response.status} ${response.statusText}` }
    }

    return response.json()
  } catch (err) {
    console.error(`Network error [${options.method || 'GET'}] ${url}:`, err.message)
    throw err
  }
}

export const api = {
  get:    (url)       => request(url),
  post:   (url, body) => request(url, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (url, body) => request(url, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (url)       => request(url, { method: 'DELETE' }),
  upload: (url, formData) => fetch(`${BASE_URL}/${url}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  }).then(r => r.json()),
}