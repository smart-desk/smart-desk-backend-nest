import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export interface JwtAuthGuardOptions {
    /**
     * Pass validation even if no token provided but get user data if token is provided
     * todo make sure that expired token also ignored
     */
    allowNoToken?: boolean;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private options?: JwtAuthGuardOptions) {
        super();
    }

    canActivate(context: ExecutionContext) {
        if (this.options?.allowNoToken) {
            const request = context.switchToHttp().getRequest();
            if (request.headers['authorization']) {
                return super.canActivate(context);
            }
            return true;
        }
        return super.canActivate(context);
    }
}
