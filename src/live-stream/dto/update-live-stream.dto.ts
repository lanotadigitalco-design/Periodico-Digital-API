import { PartialType } from '@nestjs/mapped-types';
import { CreateLiveStreamDto } from './create-live-stream.dto';

export class UpdateLiveStreamDto extends PartialType(CreateLiveStreamDto) {}
