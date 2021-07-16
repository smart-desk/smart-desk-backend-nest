import { ExecutionContext, HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { v4 as uuid } from 'uuid';
import { ACGuard } from 'nest-access-control';
import { createRepositoryMock, createTestAppForModule, declareCommonProviders } from '../../../test/test.utils';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { JwtAuthGuardMock } from '../../../test/mocks/jwt-auth.guard.mock';
import { AcGuardMock } from '../../../test/mocks/ac.guard.mock';
import { RolesEnum } from '../app/app.roles';
import { PromoSet } from './entities/promo-set.entity';
import { PromoSetDto } from './dto/promo-set.dto';
import { PromoModule } from './promo.module';

describe('Promo Set controller', () => {
    let app: INestApplication;
    const promoSet = new PromoSet();
    promoSet.id = uuid();
    promoSet.days = 7;
    promoSet.price = 100;
    promoSet.name = 'Name';

    const promoSetRepositoryMock = createRepositoryMock<PromoSet>([promoSet]);

    const JwtGuard = JwtAuthGuardMock;

    beforeAll(async () => {
        let moduleBuilder = Test.createTestingModule({
            imports: [PromoModule],
        });

        const moduleRef = await declareCommonProviders(moduleBuilder)
            .overrideProvider(getRepositoryToken(PromoSet))
            .useValue(promoSetRepositoryMock)
            .overrideGuard(JwtAuthGuard)
            .useValue(JwtGuard)
            .overrideGuard(ACGuard)
            .useValue(AcGuardMock)
            .compile();

        app = await createTestAppForModule(moduleRef);
    });

    describe('create promo set', () => {
        it(`successfully`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: [RolesEnum.USER, RolesEnum.ADMIN] };
                return true;
            });

            return request(app.getHttpServer())
                .post('/promo-set')
                .send({
                    name: 'Name',
                    days: 3,
                    price: 10,
                } as PromoSetDto)
                .expect(HttpStatus.CREATED);
        });

        it(`with error - wrong props`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: [RolesEnum.USER, RolesEnum.ADMIN] };
                return true;
            });

            return request(app.getHttpServer())
                .post('/promo-set')
                .send({
                    name: 123,
                    days: 'dd',
                    price: 'err',
                } as any)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('name must be shorter than or equal to 100 characters');
                    expect(res.body.message).toContain('days must be an integer number');
                    expect(res.body.message).toContain('days must be an integer number');
                    expect(res.body.message).toContain('price must be an integer number');
                });
        });

        it(`with error for not logged in user`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).post('/promo-set').send({}).expect(HttpStatus.FORBIDDEN);
        });

        it(`with error not an admin`, () => {
            return request(app.getHttpServer())
                .post('/promo-set')
                .send({
                    name: 'Name',
                    days: 3,
                    price: 10,
                })
                .expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('get promo sets', () => {
        it(`successfully`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: [RolesEnum.USER, RolesEnum.ADMIN] };
                return true;
            });

            return request(app.getHttpServer()).get('/promo-set').expect(HttpStatus.OK);
        });

        it(`with error for not logged in user`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).get('/promo-set').expect(HttpStatus.FORBIDDEN);
        });

        it(`with error not an admin`, () => {
            return request(app.getHttpServer()).get('/promo-set').expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('get promo set', () => {
        it(`successfully`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: [RolesEnum.USER, RolesEnum.ADMIN] };
                return true;
            });

            return request(app.getHttpServer()).get(`/promo-set/${uuid()}`).expect(HttpStatus.OK);
        });

        it(`with error for not logged in user`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).get(`/promo-set/${uuid()}`).expect(HttpStatus.FORBIDDEN);
        });

        it(`with error not an admin`, () => {
            return request(app.getHttpServer()).get(`/promo-set/${uuid()}`).expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('update promo set', () => {
        it(`successfully`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: [RolesEnum.USER, RolesEnum.ADMIN] };
                return true;
            });

            return request(app.getHttpServer())
                .patch(`/promo-set/${uuid()}`)
                .send({
                    name: 'Name',
                    days: 3,
                    price: 10,
                } as PromoSetDto)
                .expect(HttpStatus.OK);
        });

        it(`with error - wrong props`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: [RolesEnum.USER, RolesEnum.ADMIN] };
                return true;
            });

            return request(app.getHttpServer())
                .patch(`/promo-set/${uuid()}`)
                .send({
                    name: 1,
                    days: 'dsds',
                    price: 'sdss',
                } as any)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('name must be shorter than or equal to 100 characters');
                    expect(res.body.message).toContain('name must be a string');
                    expect(res.body.message).toContain('days must be an integer number');
                    expect(res.body.message).toContain('price must be an integer number');
                });
        });

        it(`with error for not logged in user`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).patch(`/promo-set/${uuid()}`).send({}).expect(HttpStatus.FORBIDDEN);
        });

        it(`with error not an admin`, () => {
            return request(app.getHttpServer())
                .patch(`/promo-set/${uuid()}`)
                .send({
                    name: 'Name',
                    days: 3,
                    price: 10,
                })
                .expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('delete promo set by id', () => {
        it(`successfully`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: [RolesEnum.USER, RolesEnum.ADMIN] };
                return true;
            });

            return request(app.getHttpServer()).delete(`/promo-set/${uuid()}`).expect(HttpStatus.NO_CONTENT);
        });

        it(`with error for not logged in user`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).delete(`/promo-set/${uuid()}`).expect(HttpStatus.FORBIDDEN);
        });

        it(`with error not an admin`, () => {
            return request(app.getHttpServer()).delete(`/promo-set/${uuid()}`).expect(HttpStatus.FORBIDDEN);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
