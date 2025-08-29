import { Request, Response } from 'express';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services?: Record<string, 'up' | 'down'>;
  memory?: {
    used: number;
    total: number;
    percentage: number;
  };
}

export class HealthChecker {
  private startTime: number;
  private version: string;

  constructor(version = '1.0.0') {
    this.startTime = Date.now();
    this.version = version;
  }

  async checkHealth(): Promise<HealthCheckResult> {
    const uptime = (Date.now() - this.startTime) / 1000;
    const memoryUsage = process.memoryUsage();

    const memoryInfo = {
      used: memoryUsage.heapUsed,
      total: memoryUsage.heapTotal,
      percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
    };

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (memoryInfo.percentage > 90) {
      status = 'unhealthy';
    } else if (memoryInfo.percentage > 75) {
      status = 'degraded';
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime,
      version: this.version,
      environment: process.env.NODE_ENV || 'development',
      memory: memoryInfo,
    };
  }

  healthEndpoint = async (req: Request, res: Response): Promise<void> => {
    try {
      const health = await this.checkHealth();
      const statusCode = health.status === 'healthy' ? 200 :
                        health.status === 'degraded' ? 200 : 503;

      res.status(statusCode).json({
        success: true,
        data: health,
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: 'Health check failed',
        data: {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
        },
      });
    }
  };

  readinessEndpoint = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json({
        success: true,
        data: {
          status: 'ready',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: 'Service not ready',
      });
    }
  };
}
