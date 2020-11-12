import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { v4 as uuid } from 'uuid';
import { createRepositoryMock, createTestAppForModule } from '../../test/test.utils';
import { Advert } from './entities/advert.entity';
import { AdvertsModule } from './adverts.module';
import { Connection } from 'typeorm';
import { InputTextEntity } from './entities/input-text.entity';
import { TextareaEntity } from './entities/textarea.entity';
import { RadioEntity } from './entities/radio.entity';
import { Field } from '../fields/field.entity';
import { Section, SectionType } from '../sections/section.entity';

describe('Adverts controller', () => {
    let app: INestApplication;
    const sectionEntity = new Section();
    sectionEntity.id = '123123';
    sectionEntity.model_id = '123';
    sectionEntity.type = SectionType.PARAMS;
    sectionEntity.fields = [];

    const advertEntity = new Advert();
    advertEntity.id = '1234';
    advertEntity.sections = [sectionEntity, sectionEntity];

    const advertRepositoryMock = createRepositoryMock<Advert>([advertEntity]);
    const sectionRepositoryMock = createRepositoryMock<Section>([sectionEntity]);
    const connectionMock = {
        manager: createRepositoryMock(),
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
            .useValue(createRepositoryMock())
            .overrideProvider(getRepositoryToken(InputTextEntity))
            .useValue(createRepositoryMock())
            .overrideProvider(getRepositoryToken(TextareaEntity))
            .useValue(createRepositoryMock())
            .overrideProvider(getRepositoryToken(RadioEntity))
            .useValue(createRepositoryMock())
            .overrideProvider(Connection)
            .useValue(connectionMock)
            .compile();

        app = await createTestAppForModule(moduleRef);
    });

    describe('get adverts', () => {
        it(`successfully with no params`, () => {
            return request(app.getHttpServer())
                .get('/adverts')
                .expect(HttpStatus.OK)
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
                .expect(HttpStatus.OK)
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
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('page must be a positive number');
                });
        });

        it(`with error - not valid limit, no negative numbers`, () => {
            return request(app.getHttpServer())
                .get('/adverts')
                .query({ limit: -1 })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('limit must be a positive number');
                });
        });

        it(`with error - not valid limit, no greater than 100`, () => {
            return request(app.getHttpServer())
                .get('/adverts')
                .query({ limit: 300 })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('limit must not be greater than 100');
                });
        });

        it(`with error - not valid category`, () => {
            return request(app.getHttpServer())
                .get('/adverts')
                .query({ category_id: 12333 })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('category_id must be an UUID');
                });
        });

        it(`with error - not valid search`, () => {
            return request(app.getHttpServer())
                .get('/adverts')
                .query({ search: Array(300).fill('a').join('') })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('search must be shorter than or equal to 255 characters');
                });
        });
    });

    describe('get advert by id', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).get('/adverts/123123').expect(HttpStatus.OK);
        });

        it(`with error - not found`, () => {
            advertRepositoryMock.findOne.mockReturnValueOnce(undefined);
            return request(app.getHttpServer()).get('/adverts/123123').expect(HttpStatus.NOT_FOUND);
        });
    });

    describe('delete advert by id', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).delete('/adverts/123123').expect(HttpStatus.NO_CONTENT);
        });

        it(`with error - not found`, () => {
            advertRepositoryMock.findOne.mockReturnValueOnce(undefined);
            return request(app.getHttpServer()).delete('/adverts/123123').expect(HttpStatus.NOT_FOUND);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
