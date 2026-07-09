const API_BASE_URL = 'http://localhost:5000/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('sfms_auth_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const request = async (url, options = {}) => {
  const method = (options.method || 'GET').toUpperCase()
  console.debug(`[API] ${method} ${API_BASE_URL}${url}`)

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    console.debug(`[API] ${method} ${API_BASE_URL}${url} -> ${response.status}`)
    throw new Error(payload?.message || 'Request failed')
  }

  console.debug(`[API] ${method} ${API_BASE_URL}${url} -> ${response.status}`)
  return payload
}

export async function login({ email, password }) {
  try {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    localStorage.setItem('sfms_auth_token', data.token)
    localStorage.setItem('sfms_teacher_email', data.user?.email || email)
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

export function logout() {
  localStorage.removeItem('sfms_auth_token')
  localStorage.removeItem('sfms_teacher_email')
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem('sfms_auth_token'))
}

export function getTeacherEmail() {
  return localStorage.getItem('sfms_teacher_email') || 'teacher@school.com'
}

export async function getStudents() {
  return request('/students')
}

export async function getStudentById(id) {
  return request(`/students/${id}`)
}

export async function addStudent(studentData) {
  return request('/students', {
    method: 'POST',
    body: JSON.stringify(studentData),
  })
}

export async function updateStudent(id, studentData) {
  return request(`/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(studentData),
  })
}

export async function deleteStudent(id) {
  return request(`/students/${id}`, { method: 'DELETE' })
}

export async function getPayments() {
  return request('/payments')
}

export async function addPayment(paymentData) {
  return request('/payments', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  })
}

export async function getDashboardStats() {
  return request('/payments/dashboard')
}
