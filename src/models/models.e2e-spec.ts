import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ModelsModule } from './models.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Model } from './model.entity';
import { createRepositoryMock, createTestAppForModule } from '../../test/test.utils';

describe('Models controller', () => {
    let app: INestApplication;
    const modelEntity = new Model();

    const modelRepositoryMock = createRepositoryMock<Model>([modelEntity]);

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
        return request(app.getHttpServer()).get('/models').expect(200);
    });

    describe('get modelEntity by id', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).get('/models/123123').expect(200).expect({});
        });

        it(`with error - not found`, () => {
            modelRepositoryMock.findOne.mockReturnValueOnce(undefined);
            return request(app.getHttpServer()).get('/models/123123').expect(404);
        });
    });

    describe('create modelEntity', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).post('/models').send({ name: 'test' }).expect(201);
        });

        it(`with error - no name`, () => {
            return request(app.getHttpServer())
                .post('/models')
                .send({ name: '1' })
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toContain('name must be longer than or equal to 3 characters');
                });
        });
    });

    describe('update modelEntity', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).put('/models/123').send({ name: 'test' }).expect(200).expect({});
        });

        it(`with error - no ID and name is to short`, () => {
            return request(app.getHttpServer())
                .put('/models/123')
                .send({ name: '1' })
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toContain('name must be longer than or equal to 3 characters');
                });
        });

        it(`with error - not found`, () => {
            modelRepositoryMock.findOne.mockReturnValueOnce(undefined);
            return request(app.getHttpServer()).put('/models/123123').send({ name: '113' }).expect(404);
        });
    });

    describe('delete modelEntity by id', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).delete('/models/123123').expect(204);
        });

        it(`with error - not found`, () => {
            modelRepositoryMock.findOne.mockReturnValueOnce(undefined);
            return request(app.getHttpServer()).delete('/models/123123').expect(404);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
