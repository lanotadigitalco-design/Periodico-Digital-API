import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { LiveStreamService } from './live-stream.service';
import { LiveStreamController } from './live-stream.controller';
import { LiveStreamCacheService } from './live-stream-cache.service';

@Module({
  imports: [
    CacheModule.register({
      store: 'memory', // Cambiar a 'redis' si quieres usar Redis
      ttl: 0, // Sin expiración
    }),
  ],
  providers: [LiveStreamService, LiveStreamCacheService],
  controllers: [LiveStreamController],
  exports: [LiveStreamService, LiveStreamCacheService],
})
export class LiveStreamModule {}
