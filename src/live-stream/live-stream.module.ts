import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveStream } from '../entities/live-stream.entity';
import { LiveStreamService } from './live-stream.service';
import { LiveStreamController } from './live-stream.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LiveStream])],
  providers: [LiveStreamService],
  controllers: [LiveStreamController],
})
export class LiveStreamModule {}
