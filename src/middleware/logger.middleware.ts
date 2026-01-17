/* import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logsService: LogsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'];
    const referer = req.headers['referer'] as string;

    res.on('finish', async () => {
      const { statusCode } = res;
      // No registrar llamadas a endpoints de logs
      if (!originalUrl.includes('/logs')) {
        await this.logsService.registrarVisualizacionSitio(
          ip,
          originalUrl,
          method,
          statusCode,
          userAgent,
          undefined,
          undefined,
          undefined,
          referer,
        );
      }
    });

    next();
  }
}
 */
