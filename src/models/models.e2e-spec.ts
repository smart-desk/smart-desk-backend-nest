import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ModelsModule } from './models.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Model } from './model.entity';
import { createTestAppForModule } from '../../test/test.utils';

describe('Models controller', () => {
    let app: INestApplication;

    const modelRepositoryMock = {
        find: () => [new Model()],
        findOne: () => new Model(),
        create: () => new Model(),
        save: () => new Model(),
        update: () => {},
        delete: () => {},
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
        return request(app.getHttpServer()).get('/models').expect(200);
    });

    it(`get model by id`, () => {
        return request(app.getHttpServer())
            .get('/models/123123')
            .expect(200)
            .expect({});
    });

    describe('create model', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer())
                .post('/models')
                .send({ name: 'test' })
                .expect(201);
        });

        it(`with error - no name`, () => {
            return request(app.getHttpServer())
                .post('/models')
                .send({ name: '1' })
                .expect(400)
                .expect((res) => {
                    expect(res.body.message).toContain(
                        'name must be longer than or equal to 3 characters',
                    );
                });
        });
    });

    describe('update model', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer())
                .put('/models')
                .send({ id: '123123', name: 'test' })
                .expect(200)
                .expect({});
        });

        it(`with error - no ID and name is to short`, () => {
            return request(app.getHttpServer())
                .put('/models')
                .send({ name: '1' })
                .expect(400)
                .expect((res) => {
                    expect(res.body.message).toContain(
                        'id should not be empty',
                    );
                    expect(res.body.message).toContain(
                        'name must be longer than or equal to 3 characters',
                    );
                });
        });
    });

    it(`delete model by id`, () => {
        return request(app.getHttpServer())
            .delete('/models/123123')
            .expect(204);
    });

    afterAll(async () => {
        await app.close();
    });
});
