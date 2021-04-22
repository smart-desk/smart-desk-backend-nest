import { ValidationPipe } from '@nestjs/common';
import { TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import fn = jest.fn;
import { getRepositoryToken } from '@nestjs/typeorm';
import { InputTextEntity } from '../src/dynamic-fields/input-text/input-text.entity';
import { TextareaEntity } from '../src/dynamic-fields/textarea/textarea.entity';
import { RadioEntity } from '../src/dynamic-fields/radio/radio.entity';
import { PhotoEntity } from '../src/dynamic-fields/photo/photo.entity';
import { LocationEntity } from '../src/dynamic-fields/location/location.entity';
import { PriceEntity } from '../src/dynamic-fields/price/price.entity';
import { CheckboxEntity } from '../src/dynamic-fields/checkbox/checkbox.entity';
import { CalendarEntity } from '../src/dynamic-fields/calendar/calendar.entity';

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
            update: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getMany: fn().mockReturnValue(resultValues),
            getCount: fn().mockReturnValue(resultValues.length),
            execute: fn(),
        }),
        find: fn().mockReturnValue(resultValues),
        findOne: fn().mockReturnValue(resultValues[0]),
        findAndCount: fn().mockReturnValue([resultValues, resultValues.length]),
        create: fn().mockReturnValue(resultValues[0]),
        preload: fn().mockReturnValue(resultValues[0]),
        save: fn().mockReturnValue(resultValues[0]),
        remove: fn().mockReturnValue(resultValues[0]),
        count: fn().mockReturnValue(resultValues.length),
        update: fn(),
        delete: fn(),
    };
}

export function declareDynamicFieldsProviders(moduleRef: TestingModuleBuilder): TestingModuleBuilder {
    return moduleRef
        .overrideProvider(getRepositoryToken(InputTextEntity))
        .useValue(createRepositoryMock())
        .overrideProvider(getRepositoryToken(TextareaEntity))
        .useValue(createRepositoryMock())
        .overrideProvider(getRepositoryToken(RadioEntity))
        .useValue(createRepositoryMock())
        .overrideProvider(getRepositoryToken(PhotoEntity))
        .useValue(createRepositoryMock())
        .overrideProvider(getRepositoryToken(LocationEntity))
        .useValue(createRepositoryMock())
        .overrideProvider(getRepositoryToken(PriceEntity))
        .useValue(createRepositoryMock())
        .overrideProvider(getRepositoryToken(CheckboxEntity))
        .useValue(createRepositoryMock())
        .overrideProvider(getRepositoryToken(CalendarEntity))
        .useValue(createRepositoryMock());
}
