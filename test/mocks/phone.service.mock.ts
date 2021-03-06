import { ExecutionContext } from '@nestjs/common';
import fn = jest.fn;

export const PhoneServiceMock = {
    verifyRequest: fn().mockImplementation((context: ExecutionContext) => {
        return new Promise(resolve => resolve('111111111ass'));
    }),

    verifyCheck: fn().mockImplementation((context: ExecutionContext) => {
        return new Promise(resolve => resolve('0'));
    }),
};
