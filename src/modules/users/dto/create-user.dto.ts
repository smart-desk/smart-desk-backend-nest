import { UserStatus } from '../models/user-status.enum';
import { NotificationTypes } from '../models/notification-types.enum';

export class CreateUserDto {
    firstName: string;
    lastName: string;
    roles: string[];
    status: UserStatus;
    emailNotifications: NotificationTypes[];
    email?: string;
    avatar?: string;
    vkId?: string;
}
