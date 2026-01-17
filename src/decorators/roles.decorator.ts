import { SetMetadata } from '@nestjs/common';
import { RolEnum } from '../entities/rol.entity';

export const Roles = (...roles: RolEnum[]) => SetMetadata('roles', roles);
