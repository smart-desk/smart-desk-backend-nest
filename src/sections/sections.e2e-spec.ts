import { ExecutionContext, HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { v4 as uuid } from 'uuid';
import { AccessControlModule, ACGuard } from 'nest-access-control';
import { createRepositoryMock, createTestAppForModule } from '../../test/test.utils';
import { Section, SectionType } from './section.entity';
import { SectionsModule } from './sections.module';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtAuthGuardMock } from '../../test/mocks/jwt-auth.guard.mock';
import { AcGuardMock } from '../../test/mocks/ac.guard.mock';
import { roles, RolesEnum } from '../app/app.roles';

describe('Sections controller', () => {
    let app: INestApplication;
    const sectionEntity = new Section();

    const sectionRepositoryMock = createRepositoryMock<Section>([sectionEntity]);

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [SectionsModule],
        })
            .overrideProvider(getRepositoryToken(Section))
            .useValue(sectionRepositoryMock)
            .overrideGuard(JwtAuthGuard)
            .useValue(JwtAuthGuardMock)
            .overrideGuard(ACGuard)
            .useValue(AcGuardMock)
            .compile();

        app = await createTestAppForModule(moduleRef);
    });

    describe('create section', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer())
                .post('/sections')
                .send({ type: SectionType.PARAMS, model_id: uuid() })
                .expect(HttpStatus.CREATED);
        });

        it(`with error - wrong type`, () => {
            return request(app.getHttpServer())
                .post('/sections')
                .send({ type: 'wrong_type', model_id: uuid() })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('type must be a valid enum value');
                });
        });

        it(`with error - wrong model_id`, () => {
            return request(app.getHttpServer())
                .post('/sections')
                .send({ type: SectionType.PARAMS, model_id: '12312312' })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('model_id must be an UUID');
                });
        });
    });

    describe('delete section by id', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).delete(`/sections/${uuid()}`).expect(HttpStatus.NO_CONTENT);
        });

        it(`with error - not found`, () => {
            sectionRepositoryMock.findOne.mockReturnValueOnce(undefined);
            return request(app.getHttpServer()).delete(`/sections/${uuid()}`).expect(HttpStatus.NOT_FOUND);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});

describe('Sections controller with ACL enabled', () => {
    let app: INestApplication;
    const sectionEntity = new Section();
    const JwtGuard = JwtAuthGuardMock;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [SectionsModule, AccessControlModule.forRoles(roles)],
        })
            .overrideProvider(getRepositoryToken(Section))
            .useValue(
                createRepositoryMock<Section>([sectionEntity])
            )
            .overrideGuard(JwtAuthGuard)
            .useValue(JwtGuard)
            .compile();

        app = await createTestAppForModule(moduleRef);
    });

    describe('create section', () => {
        it(`successfully`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: [RolesEnum.USER, RolesEnum.ADMIN] };
                return true;
            });

            return request(app.getHttpServer())
                .post('/sections')
                .send({ type: SectionType.PARAMS, model_id: uuid() })
                .expect(HttpStatus.CREATED);
        });

        it(`with error unauthorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);

            return request(app.getHttpServer())
                .post('/sections')
                .send({ type: SectionType.PARAMS, model_id: uuid() })
                .expect(HttpStatus.FORBIDDEN);
        });

        it(`with error not an admin`, () => {
            return request(app.getHttpServer())
                .post('/sections')
                .send({ type: SectionType.PARAMS, model_id: uuid() })
                .expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('delete section by id', () => {
        it(`successfully`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: [RolesEnum.USER, RolesEnum.ADMIN] };
                return true;
            });
            return request(app.getHttpServer()).delete(`/sections/${uuid()}`).expect(HttpStatus.NO_CONTENT);
        });

        it(`with error unauthorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).delete(`/sections/${uuid()}`).expect(HttpStatus.FORBIDDEN);
        });

        it(`with error not an admin`, () => {
            return request(app.getHttpServer()).delete(`/sections/${uuid()}`).expect(HttpStatus.FORBIDDEN);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
