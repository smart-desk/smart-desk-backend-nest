import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuardMock extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest();
        req.user = { id: '123', email: 'test@email.com', roles: ['user'] };
        return true;
    }
}
