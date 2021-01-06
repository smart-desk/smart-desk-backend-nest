export class CreateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
    avatar?: string;
}
