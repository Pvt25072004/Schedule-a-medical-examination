import { SetMetadata } from '@nestjs/common';
import type { User } from '../users/entities/user.entity';

export const ROLES_KEY = 'roles';
export type Role = User['role'];

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);


