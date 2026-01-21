import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { LiveStream } from '../entities/live-stream.entity';

@Injectable()
export class LiveStreamCacheService {
  private readonly LIVE_STREAM_KEY = 'active_live_stream';

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async setLiveStream(liveStream: Partial<LiveStream>): Promise<void> {
    await this.cacheManager.set(this.LIVE_STREAM_KEY, liveStream, 0); // 0 = sin expiración
  }

  async getLiveStream(): Promise<Partial<LiveStream> | null> {
    const stream = await this.cacheManager.get<Partial<LiveStream>>(
      this.LIVE_STREAM_KEY,
    );
    return stream || null;
  }

  async deleteLiveStream(): Promise<void> {
    await this.cacheManager.del(this.LIVE_STREAM_KEY);
  }

  async hasLiveStream(): Promise<boolean> {
    const stream = await this.getLiveStream();
    return stream !== null && stream !== undefined;
  }
}
