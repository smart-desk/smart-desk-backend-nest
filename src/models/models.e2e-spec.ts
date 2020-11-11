import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { createTestAppForModule } from '../../test/test.utils';
import { Model } from './model.entity';
import { ModelsModule } from './models.module';
import fn = jest.fn;

describe('Models controller', () => {
    let app: INestApplication;
    const modelEntity = new Model();

    const modelRepositoryMock = {
        find: fn().mockReturnValue([modelEntity]),
        findOne: fn().mockReturnValue(modelEntity),
        create: fn().mockReturnValue(modelEntity),
        save: fn().mockReturnValue(modelEntity),
        update: fn(),
        delete: fn(),
    };

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [ModelsModule],
        })
            .overrideProvider(getRepositoryToken(Model))
            .useValue(modelRepositoryMock)
            .compile();

        app = await createTestAppForModule(moduleRef);
    });

    it(`get all models`, () => {
        return request(app.getHttpServer()).get('/models').expect(HttpStatus.OK);
    });

    describe('get modelEntity by id', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).get('/models/123123').expect(HttpStatus.OK).expect({});
        });

        it(`with error - not found`, () => {
            modelRepositoryMock.findOne.mockReturnValueOnce(undefined);
            return request(app.getHttpServer()).get('/models/123123').expect(HttpStatus.NOT_FOUND);
        });
    });

    describe('create modelEntity', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).post('/models').send({ name: 'test' }).expect(HttpStatus.CREATED);
        });

        it(`with error - no name`, () => {
            return request(app.getHttpServer())
                .post('/models')
                .send({ name: '1' })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('name must be longer than or equal to 3 characters');
                });
        });
    });

    describe('update modelEntity', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).put('/models/123').send({ name: 'test' }).expect(HttpStatus.OK).expect({});
        });

        it(`with error - no ID and name is to short`, () => {
            return request(app.getHttpServer())
                .put('/models/123')
                .send({ name: '1' })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('name must be longer than or equal to 3 characters');
                });
        });

        it(`with error - not found`, () => {
            modelRepositoryMock.findOne.mockReturnValueOnce(undefined);
            return request(app.getHttpServer()).put('/models/123123').send({ name: '113' }).expect(HttpStatus.NOT_FOUND);
        });
    });

    describe('delete modelEntity by id', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).delete('/models/123123').expect(HttpStatus.NO_CONTENT);
        });

        it(`with error - not found`, () => {
            modelRepositoryMock.findOne.mockReturnValueOnce(undefined);
            return request(app.getHttpServer()).delete('/models/123123').expect(HttpStatus.NOT_FOUND);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
