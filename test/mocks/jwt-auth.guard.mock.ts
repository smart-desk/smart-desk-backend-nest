import { ExecutionContext } from '@nestjs/common';
import fn = jest.fn;

export const JwtAuthGuardMock = {
    canActivate: fn().mockImplementation((context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: '123', email: 'test@email.com', roles: ['user'] };
        return true;
    }),
};
