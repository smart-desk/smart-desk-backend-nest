import { ValidationPipe } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import fn = jest.fn;

export async function createTestAppForModule(moduleRef: TestingModule) {
    const app = moduleRef.createNestApplication();
    app.useGlobalPipes(
        new ValidationPipe({
            forbidNonWhitelisted: true,
        })
    );
    await app.init();
    return app;
}

export function createRepositoryMock<T>(values?: T[]) {
    const resultValues = values && values.length ? [...values] : [{}];
    return {
        createQueryBuilder: fn().mockReturnValue({
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            offset: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            getMany: fn().mockReturnValue(resultValues),
            getCount: fn().mockReturnValue(resultValues.length),
        }),
        find: fn().mockReturnValue(resultValues),
        findOne: fn().mockReturnValue(resultValues[0]),
        findAndCount: fn().mockReturnValue([resultValues, resultValues.length]),
        create: fn().mockReturnValue(resultValues[0]),
        preload: fn().mockReturnValue(resultValues[0]),
        save: fn().mockReturnValue(resultValues[0]),
        remove: fn().mockReturnValue(resultValues[0]),
        update: fn(),
        delete: fn(),
    };
}
