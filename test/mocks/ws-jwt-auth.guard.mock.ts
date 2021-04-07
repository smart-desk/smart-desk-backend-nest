import { ExecutionContext } from '@nestjs/common';
import fn = jest.fn;
import { User } from '../../src/users/entities/user.entity';
import { RolesEnum } from '../../src/app/app.roles';

export const WsJwtAuthGuardMock = {
    canActivate: fn().mockImplementation((context: ExecutionContext) => {
        const user = new User();
        user.id = 'FromTestWsJwtAuthGuardMock';
        user.email = 'test@email.com';
        user.roles = [RolesEnum.USER];

        context.switchToWs().getData().user = user;

        return true;
    }),
};
