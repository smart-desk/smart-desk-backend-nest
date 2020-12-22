import { ExecutionContext, HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { v4 as uuid } from 'uuid';
import { AccessControlModule, ACGuard } from 'nest-access-control';
import { Model } from './model.entity';
import { createRepositoryMock, createTestAppForModule } from '../../test/test.utils';
import { ModelsModule } from './models.module';
import { Section } from '../sections/section.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtAuthGuardMock } from '../../test/mocks/jwt-auth.guard.mock';
import { AcGuardMock } from '../../test/mocks/ac.guard.mock';
import { roles, RolesEnum } from '../app/app.roles';

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
            return request(app.getHttpServer()).get(`/models/${uuid()}`).expect(HttpStatus.OK).expect({});
        });

        it(`with error - not found`, () => {
            modelRepositoryMock.findOne.mockReturnValueOnce(undefined);
            return request(app.getHttpServer()).get(`/models/${uuid()}`).expect(HttpStatus.NOT_FOUND);
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
            return request(app.getHttpServer()).put(`/models/${uuid()}`).send({ name: 'test' }).expect(HttpStatus.OK).expect({});
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
            return request(app.getHttpServer()).put(`/models/${uuid()}`).send({ name: '113' }).expect(HttpStatus.NOT_FOUND);
        });
    });

    describe('delete model by id', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).delete(`/models/${uuid()}`).expect(HttpStatus.NO_CONTENT);
        });

        it(`with error - not found`, () => {
            modelRepositoryMock.findOne.mockReturnValueOnce(undefined);
            return request(app.getHttpServer()).delete(`/models/${uuid()}`).expect(HttpStatus.NOT_FOUND);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});

describe('Models controller with ACL enabled', () => {
    let app: INestApplication;
    const modelEntity = new Model();
    const sectionEntity = new Section();
    const JwtGuard = JwtAuthGuardMock;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [ModelsModule, AccessControlModule.forRoles(roles)],
        })
            .overrideProvider(getRepositoryToken(Model))
            .useValue(createRepositoryMock([modelEntity]))
            .overrideProvider(getRepositoryToken(Section))
            .useValue(createRepositoryMock([sectionEntity]))
            .overrideGuard(JwtAuthGuard)
            .useValue(JwtGuard)
            .compile();

        app = await createTestAppForModule(moduleRef);
    });

    it(`get all models`, () => {
        return request(app.getHttpServer()).get('/models').expect(HttpStatus.OK);
    });

    it(`get model by id`, () => {
        return request(app.getHttpServer()).get(`/models/${uuid()}`).expect(HttpStatus.OK).expect({});
    });

    describe('create model', () => {
        it(`successfully`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: [RolesEnum.USER, RolesEnum.ADMIN] };
                return true;
            });

            return request(app.getHttpServer()).post('/models').send({ name: 'test' }).expect(HttpStatus.CREATED);
        });

        it(`with error unauthorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).post('/models').send({ name: 'test' }).expect(HttpStatus.FORBIDDEN);
        });

        it(`with error not an admin`, () => {
            return request(app.getHttpServer()).post('/models').send({ name: 'test' }).expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('update model', () => {
        it(`successfully`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: [RolesEnum.USER, RolesEnum.ADMIN] };
                return true;
            });

            return request(app.getHttpServer()).put(`/models/${uuid()}`).send({ name: 'test' }).expect(HttpStatus.OK);
        });

        it(`with error unauthorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).put(`/models/${uuid()}`).send({ name: 'test' }).expect(HttpStatus.FORBIDDEN);
        });

        it(`with error not an admin`, () => {
            return request(app.getHttpServer()).put(`/models/${uuid()}`).send({ name: 'test' }).expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('delete model by id', () => {
        it(`successfully`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: [RolesEnum.USER, RolesEnum.ADMIN] };
                return true;
            });
            return request(app.getHttpServer()).delete(`/models/${uuid()}`).expect(HttpStatus.NO_CONTENT);
        });

        it(`with error unauthorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).delete(`/models/${uuid()}`).expect(HttpStatus.FORBIDDEN);
        });

        it(`with error not an admin`, () => {
            return request(app.getHttpServer()).delete(`/models/${uuid()}`).expect(HttpStatus.FORBIDDEN);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
