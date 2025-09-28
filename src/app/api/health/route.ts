import { NextResponse } from 'next/server'
import { HealthCheckResponse } from '@/types'
import { logInfo } from '@/lib/logger'
import { asyncHandler } from '@/lib/errors'

async function healthCheckHandler(): Promise<NextResponse> {
  const startTime = Date.now()
  
  try {
    const healthData: HealthCheckResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: false, // Will be updated by db-health endpoint
      },
      version: process.env.npm_package_version || '1.0.0'
    }

    const responseTime = Date.now() - startTime

    logInfo('Health check performed', {
      responseTime,
      status: 'healthy'
    })

    return NextResponse.json(healthData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch {
    const healthData: HealthCheckResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: false
      },
      version: process.env.npm_package_version || '1.0.0'
    }

    return NextResponse.json(healthData, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}

export const GET = asyncHandler(healthCheckHandler)