// Database types based on Prisma schema
export interface Patient {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  dateOfBirth: Date
  gender: string
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Doctor {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  specialization: string
  licenseNumber: string
  createdAt: Date
  updatedAt: Date
}

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  date: Date
  duration: number
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface MedicalRecord {
  id: string
  patientId: string
  doctorId: string
  diagnosis: string
  treatment?: string | null
  notes?: string | null
  visitDate: Date
  createdAt: Date
  updatedAt: Date
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  uptime: number
  database: {
    connected: boolean
    responseTime?: number
    mysqlLatencyMs?: number
    prismaLatencyMs?: number
  }
  version: string
}

// Form data types
export interface CreatePatientRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth: string // ISO date string
  gender: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
}

export interface CreateDoctorRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  specialization: string
  licenseNumber: string
}

export interface CreateAppointmentRequest {
  patientId: string
  doctorId: string
  date: string // ISO date string
  duration?: number
  notes?: string
}

export interface CreateMedicalRecordRequest {
  patientId: string
  doctorId: string
  diagnosis: string
  treatment?: string
  notes?: string
  visitDate: string // ISO date string
}

// Utility types
export type PatientWithAppointments = Patient & {
  appointments: Appointment[]
}

export type DoctorWithAppointments = Doctor & {
  appointments: Appointment[]
}

export type AppointmentWithDetails = Appointment & {
  patient: Patient
  doctor: Doctor
}