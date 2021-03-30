import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { omit } from 'lodash';
import { JWTPayload, RequestWithUserPayload } from '../auth/jwt.strategy';
import { RolesEnum } from '../app/app.roles';
import { User } from '../users/entities/user.entity';

const EXCLUDED_USER_PROP = ['phone', 'isPhoneVerified', 'email', 'lastName'];

@Injectable()
export class UserInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<Partial<User>> {
        return next.handle().pipe(
            map((data: User) => {
                const req = context.switchToHttp().getRequest<RequestWithUserPayload>();
                return this.serializeUser(data, req.user);
            })
        );
    }

    private serializeUser(user: User, requester: JWTPayload): Partial<User> {
        if (!requester) {
            return omit(user, EXCLUDED_USER_PROP);
        }

        if (requester.roles.includes(RolesEnum.ADMIN) || requester.id === user.id) {
            return user;
        }
        return omit(user, EXCLUDED_USER_PROP);
    }
}
