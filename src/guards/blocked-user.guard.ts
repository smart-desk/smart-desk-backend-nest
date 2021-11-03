import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RequestWithUserPayload } from '../modules/auth/jwt.strategy';
import { UserStatus } from '../modules/users/models/user-status.enum';

@Injectable()
export class BlockedUserGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: RequestWithUserPayload = context.switchToHttp().getRequest();
        return request.user?.status !== UserStatus.BLOCKED;
    }
}
