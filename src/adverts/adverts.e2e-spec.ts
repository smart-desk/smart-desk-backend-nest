import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { v4 as uuid } from 'uuid';
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

        it(`successfully with page, limit, search and category`, () => {
            return request(app.getHttpServer())
                .get('/adverts')
                .query({
                    page: 2,
                    limit: 2,
                    category_id: uuid(),
                    search: test,
                })
                .expect(200)
                .expect(res => {
                    expect(res.body.adverts).toBeDefined();
                    expect(res.body.limit).toEqual(2);
                    expect(res.body.totalCount).toEqual(1);
                    expect(res.body.page).toEqual(2);
                });
        });

        it(`with error - not valid page`, () => {
            return request(app.getHttpServer())
                .get('/adverts')
                .query({ page: 0 })
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toContain('page must be a positive number');
                });
        });

        it(`with error - not valid limit, no negative numbers`, () => {
            return request(app.getHttpServer())
                .get('/adverts')
                .query({ limit: -1 })
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toContain('limit must be a positive number');
                });
        });

        it(`with error - not valid limit, no greater than 100`, () => {
            return request(app.getHttpServer())
                .get('/adverts')
                .query({ limit: 300 })
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toContain('limit must not be greater than 100');
                });
        });

        it(`with error - not valid category`, () => {
            return request(app.getHttpServer())
                .get('/adverts')
                .query({ category_id: 12333 })
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toContain('category_id must be an UUID');
                });
        });

        it(`with error - not valid search`, () => {
            return request(app.getHttpServer())
                .get('/adverts')
                .query({ search: Array(300).fill('a').join('') })
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toContain('search must be shorter than or equal to 255 characters');
                });
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
