import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Model } from './model.entity';
import { createRepositoryMock, createTestAppForModule } from '../../test/test.utils';
import { ModelsModule } from './models.module';
import { Section } from '../sections/section.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtAuthGuardMock } from '../../test/mocks/jwt-auth.guard.mock';
import { ACGuard } from 'nest-access-control';
import { AcGuardMock } from '../../test/mocks/ac.guard.mock';

describe('Models controller', () => {
    let app: INestApplication;
    const modelEntity = new Model();
    const sectionEntity = new Section();

    const modelRepositoryMock = createRepositoryMock<Model>([modelEntity]);
    const sectionRepository = createRepositoryMock<Section>([sectionEntity]);

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [ModelsModule],
        })
            .overrideProvider(getRepositoryToken(Model))
            .useValue(modelRepositoryMock)
            .overrideProvider(getRepositoryToken(Section))
            .useValue(sectionRepository)
            .overrideGuard(JwtAuthGuard)
            .useValue(JwtAuthGuardMock)
            .overrideGuard(ACGuard)
            .useValue(AcGuardMock)
            .compile();

        app = await createTestAppForModule(moduleRef);
    });

    it(`get all models`, () => {
        return request(app.getHttpServer()).get('/models').expect(HttpStatus.OK);
    });

    describe('get model by id', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).get('/models/123123').expect(HttpStatus.OK).expect({});
        });

        it(`with error - not found`, () => {
            modelRepositoryMock.findOne.mockReturnValueOnce(undefined);
            return request(app.getHttpServer()).get('/models/123123').expect(HttpStatus.NOT_FOUND);
        });
    });

    describe('create model', () => {
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

    describe('update model', () => {
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

    describe('delete model by id', () => {
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
