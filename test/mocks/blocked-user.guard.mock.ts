import { ExecutionContext } from '@nestjs/common';
import fn = jest.fn;

export const BlockedUserGuardMock = {
    canActivate: fn().mockImplementation((context: ExecutionContext) => {
        return true;
    }),
};
