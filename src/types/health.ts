export type HealthStatus = "ok" | "degraded" | "down";

export interface HealthIndicator {
  component: string;
  status: HealthStatus;
  latencyMs?: number;
  checkedAt: string;
  meta?: Record<string, unknown>;
}

export interface HealthResponse {
  status: HealthStatus;
  timestamp: string;
  uptimeSec: number;
  version: string;
  checks: HealthIndicator[];
}
