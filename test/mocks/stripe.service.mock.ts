import { ExecutionContext } from '@nestjs/common';
import fn = jest.fn;

export const StripeServiceMock = {
    createPaymentSession: fn().mockImplementation((context: ExecutionContext) => {
        return new Promise(resolve => resolve({ id: '111111111ass' }));
    }),

    checkSignatureAndCreateEvent: fn().mockImplementation((context: ExecutionContext) => {
        return new Promise(resolve => resolve({ type: 'charge.succeeded' }));
    }),
};
