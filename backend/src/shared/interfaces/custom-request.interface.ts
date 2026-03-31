import { Request } from 'express';
import { UserEntity } from '../../modules/users/users.entity';

// Extend Express Request properly without modifying class behavior
export interface CustomRequest extends Request {}
