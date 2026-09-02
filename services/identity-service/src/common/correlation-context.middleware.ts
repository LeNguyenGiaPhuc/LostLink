import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { resolveCorrelationId } from './correlation-id';

@Injectable()
export class CorrelationContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const id = resolveCorrelationId(req.header('X-Correlation-Id'));
    Object.assign(req, { correlationId: id });
    res.setHeader('X-Correlation-Id', id);
    next();
  }
}
