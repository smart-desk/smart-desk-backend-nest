import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { createTestAppForModule } from '../../test/test.utils';
import { Advert } from './entities/advert.entity';
import { AdvertsModule } from './adverts.module';
import { Connection } from 'typeorm';
import { InputTextEntity } from './entities/input-text.entity';
import { TextareaEntity } from './entities/textarea.entity';
import { RadioEntity } from './entities/radio.entity';
import { Field } from '../fields/field.entity';
import { Section, SectionType } from '../sections/section.entity';
import fn = jest.fn;

describe('Adverts controller', () => {
    let app: INestApplication;
    const section = new Section();
    section.id = '123123';
    section.model_id = '123';
    section.type = SectionType.PARAMS;
    section.fields = [];

    const advertEntity = new Advert();
    advertEntity.id = '1234';
    advertEntity.sections = [section, section];

    const anyRepositoryMock = {
        createQueryBuilder: fn().mockReturnValue({
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            offset: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            getMany: fn().mockReturnValue([{}]),
            getCount: fn().mockReturnValue(1),
        }),
        find: fn().mockReturnValue({}),
        findOne: fn().mockReturnValue({}),
        create: fn().mockReturnValue({}),
        preload: fn().mockReturnValue({}),
        save: fn().mockReturnValue({}),
        remove: fn().mockReturnValue({}),
    };

    const advertRepositoryMock = {
        ...anyRepositoryMock,
    };

    const sectionRepositoryMock = {
        ...anyRepositoryMock,
        find: anyRepositoryMock.find.mockReturnValue([section]),
    };

    const connectionMock = {
        manager: fn().mockReturnValue(anyRepositoryMock),
    };

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AdvertsModule, TypeOrmModule.forRoot()],
        })
            .overrideProvider(getRepositoryToken(Advert))
            .useValue(advertRepositoryMock)
            .overrideProvider(getRepositoryToken(Section))
            .useValue(sectionRepositoryMock)
            .overrideProvider(getRepositoryToken(Field))
            .useValue(anyRepositoryMock)
            .overrideProvider(getRepositoryToken(InputTextEntity))
            .useValue(anyRepositoryMock)
            .overrideProvider(getRepositoryToken(TextareaEntity))
            .useValue(anyRepositoryMock)
            .overrideProvider(getRepositoryToken(RadioEntity))
            .useValue(anyRepositoryMock)
            .overrideProvider(Connection)
            .useValue(connectionMock)
            .compile();

        app = await createTestAppForModule(moduleRef);
    });

    describe('get adverts', () => {
        it(`successfully with no params`, () => {
            return request(app.getHttpServer())
                .get('/adverts')
                .expect(200)
                .expect(res => {
                    expect(res.body.adverts).toBeDefined();
                    expect(res.body.limit).toEqual(20);
                    expect(res.body.totalCount).toEqual(1);
                    expect(res.body.page).toEqual(1);
                });
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
