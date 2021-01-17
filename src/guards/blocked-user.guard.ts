import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RequestWithUserPayload } from '../auth/jwt.strategy';

@Injectable()
export class BlockedUserGuard implements CanActivate {
    constructor(private userService: UsersService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: RequestWithUserPayload = context.switchToHttp().getRequest();
        const isBlocked = await this.userService.isUserBlocked(request.user.id);
        return !isBlocked;
    }
}