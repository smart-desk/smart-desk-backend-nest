import { UserStatus } from '../user-status.enum';

export class CreateUserDto {
    firstName: string;
    lastName: string;
    roles: string[];
    status: UserStatus;
    email?: string;
    avatar?: string;
    vkId?: string;
}
