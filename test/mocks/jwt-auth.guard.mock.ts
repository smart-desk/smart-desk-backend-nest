import { ExecutionContext } from '@nestjs/common';
import { UserStatus } from '../../src/modules/users/models/user-status.enum';
import fn = jest.fn;

export const JwtAuthGuardMock = {
    canActivate: fn().mockImplementation((context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: 'cdad7290-07c9-4419-a9d7-2c6c843fef50', email: 'test@email.com', roles: ['user'], status: UserStatus.ACTIVE };
        return true;
    }),
};
