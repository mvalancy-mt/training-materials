import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';

export const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
  cors({
    origin: process.env['CORS_ORIGIN']?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
  compression(),
];

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';

    if (process.env['NODE_ENV'] !== 'test') {
      console.log(`${logLevel.toUpperCase()}: ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    }
  });

  next();
};

export const rateLimiter = (windowMs: number, maxRequests: number) => {
  const clients = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    const client = clients.get(clientId);

    if (!client || now > client.resetTime) {
      clients.set(clientId, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    if (client.count >= maxRequests) {
      res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later',
        retryAfter: Math.ceil((client.resetTime - now) / 1000),
      });
      return;
    }

    client.count++;
    next();
  };
};
