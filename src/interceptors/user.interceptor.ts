import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestWithUserPayload } from '../modules/auth/jwt.strategy';
import { RolesEnum } from '../modules/app/app.roles';
import { User } from '../modules/users/entities/user.entity';
import { serializeUser } from '../utils/user.serializer';

@Injectable()
export class UserInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<Partial<User>> {
        return next.handle().pipe(
            map((data: User) => {
                const req = context.switchToHttp().getRequest<RequestWithUserPayload>();
                return this.serializeUserBasedOnRole(data, req.user);
            })
        );
    }

    private serializeUserBasedOnRole(user: User, requester: User): Partial<User> {
        if (!requester) {
            return serializeUser(user);
        }

        if (requester.roles.includes(RolesEnum.ADMIN) || requester.id === user.id) {
            return user;
        }
        return serializeUser(user);
    }
}
