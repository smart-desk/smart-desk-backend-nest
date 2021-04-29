import { User } from '../modules/users/entities/user.entity';
import { omit } from 'lodash';

const EXCLUDED_USER_PROP = ['phone', 'isPhoneVerified', 'email', 'lastName'];

export const serializeUser = (user: User): User => omit(user, EXCLUDED_USER_PROP) as User;
