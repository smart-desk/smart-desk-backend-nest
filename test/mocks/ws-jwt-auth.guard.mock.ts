import { ExecutionContext } from '@nestjs/common';
import fn = jest.fn;
import { User } from '../../src/modules/users/entities/user.entity';
import { RolesEnum } from '../../src/modules/app/app.roles';

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
