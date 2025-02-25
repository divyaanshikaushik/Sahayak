export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  EMAIL_IN_USE: 'A user with this email already exists',
  WEAK_PASSWORD: 'Password is too weak',
  GENERIC_ERROR: 'An unexpected error occurred',
} as const;

export const HEALTH_STATUS = {
  IMPROVING: 'improving',
  DETERIORATING: 'deteriorating',
} as const;

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DOCTOR: (id: string) => `/doctor/${id}`,
  PATIENT: (id: string) => `/patient/${id}`,
  PATIENT_REPORT: (patientId: string, reportId: string) => `/patient/${patientId}/report/${reportId}`,
  DOCTOR_PATIENT: (doctorId: string, patientId: string) => `/doctor/${doctorId}/patient/${patientId}`,
  DOCTOR_PATIENT_REPORT: (doctorId: string, patientId: string, reportId: string) => 
    `/doctor/${doctorId}/patient/${patientId}/report/${reportId}`,
} as const;