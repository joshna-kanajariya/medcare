'use client'

import { useState } from 'react'

interface HealthStatusProps {
  endpoint: string
  title: string
}

export function HealthStatus({ endpoint, title }: HealthStatusProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)

  const checkHealth = async () => {
    setStatus('loading')
    try {
      const response = await fetch(endpoint)
      const data = await response.json()
      setResult(data)
      setStatus(response.ok ? 'success' : 'error')
    } catch {
      setResult({ error: 'Failed to fetch health status' })
      setStatus('error')
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'loading': return 'text-warning-500'
      case 'success': return result?.status === 'healthy' ? 'text-success-500' : 'text-error-500'
      case 'error': return 'text-error-500'
      default: return 'text-neutral-500'
    }
  }

  return (
    <div className="medical-card p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <button
          onClick={checkHealth}
          disabled={status === 'loading'}
          className="px-3 py-1 text-sm medical-button rounded disabled:opacity-50"
        >
          {status === 'loading' ? 'Checking...' : 'Check'}
        </button>
      </div>
      
      {result && (
        <div className={`text-sm ${getStatusColor()}`}>
          <pre className="whitespace-pre-wrap break-words">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}