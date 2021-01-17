import { UserStatus } from '../user-status.enum';

export class CreateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
    status: UserStatus;
    avatar?: string;
}
