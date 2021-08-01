import { ExecutionContext } from '@nestjs/common';
import fn = jest.fn;

export const S3ServiceMock = {
    uploadTemporaryImage: fn().mockImplementation((context: ExecutionContext) => {
        return new Promise(resolve => resolve({ key: '123', url: 'string' }));
    }),

    moveImageToPublic: fn().mockImplementation((context: ExecutionContext) => {
        return new Promise(resolve => resolve());
    }),
};
