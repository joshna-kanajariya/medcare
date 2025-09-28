import { useState, useEffect } from 'react'
import { HealthCheckResponse } from '@/types'

export function useHealthCheck(endpoint: string, intervalMs: number = 30000) {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null)
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
        
        const data: HealthCheckResponse = await response.json()
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

  return { health, loading, error, isHealthy: health?.status === 'healthy' }
}

export function useDatabaseHealth(intervalMs: number = 30000) {
  return useHealthCheck('/api/db-health', intervalMs)
}

export function useSystemHealth(intervalMs: number = 30000) {
  return useHealthCheck('/api/health', intervalMs)
}