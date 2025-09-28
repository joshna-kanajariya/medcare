import { useState, useEffect } from 'react'

import type { HealthResponse } from '@/types/health'
import type { HealthCheckResponse } from '@/types'

type HealthResult<T> = {
  health: T | null
  loading: boolean
  error: string | null
  isHealthy: boolean
}

export function useHealthCheck<T>(endpoint: string, intervalMs = 30000): HealthResult<T> {
  const [health, setHealth] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setLoading(true)
        const response = await fetch(endpoint)

        if (!response.ok) {
          throw new Error(`Health check failed with status: ${response.status}`)
        }

        const data: T = await response.json()
        setHealth(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Health check failed')
        setHealth(null)
      } finally {
        setLoading(false)
      }
    }

    // Initial check
    checkHealth()

    // Set up interval for periodic checks
    const interval = setInterval(checkHealth, intervalMs)

    return () => clearInterval(interval)
  }, [endpoint, intervalMs])

  const status = (health as { status?: string } | null)?.status
  const isHealthy = status === 'healthy' || status === 'ok'

  return {
    health,
    loading,
    error,
    isHealthy,
  }
}

export function useDatabaseHealth(intervalMs: number = 30000) {
  return useHealthCheck<HealthCheckResponse>('/api/db-health', intervalMs)
}

export function useSystemHealth(intervalMs: number = 30000) {
  return useHealthCheck<HealthResponse>('/api/health', intervalMs)
}