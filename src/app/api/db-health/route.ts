import { NextResponse } from 'next/server'
import { testDatabaseConnection } from '@/lib/database'
import { HealthCheckResponse } from '@/types'
import { logInfo, logError } from '@/lib/logger'
import { asyncHandler } from '@/lib/errors'

async function databaseHealthHandler(): Promise<NextResponse> {
  const startTime = Date.now()
  
  try {
    // Test database connection
    const isConnected = await testDatabaseConnection()
    const responseTime = Date.now() - startTime

    const healthData: HealthCheckResponse = {
      status: isConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: isConnected,
        responseTime
      },
      version: process.env.npm_package_version || '1.0.0'
    }

    if (isConnected) {
      logInfo('Database health check successful', {
        responseTime,
        status: 'healthy'
      })
    } else {
      logError('Database health check failed', {
        responseTime,
        status: 'unhealthy'
      })
    }

    return NextResponse.json(healthData, {
      status: isConnected ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    const responseTime = Date.now() - startTime

    logError('Database health check error', error instanceof Error ? error : { error })

    const healthData: HealthCheckResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: false,
        responseTime
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

export const GET = asyncHandler(databaseHealthHandler)