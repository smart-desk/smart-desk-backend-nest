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
import { PromoModule } from './promo.module';
import { Promo } from './entities/promo.entity';
import * as dayjs from 'dayjs';
import { PayPromoDto } from './dto/pay-promo.dto';
import { BlockedUserGuard } from '../../guards/blocked-user.guard';
import { BlockedUserGuardMock } from '../../../test/mocks/blocked-user.guard.mock';
import { Product } from '../products/entities/product.entity';
import { PromoSet } from './entities/promo-set.entity';
import { Field } from '../fields/field.entity';
import { FieldType } from '../dynamic-fields/dynamic-fields.module';

describe('Promo controller', () => {
    let app: INestApplication;
    const promo = new Promo();
    promo.id = uuid();
    promo.promoSetId = uuid();
    promo.startDate = dayjs().toDate();
    promo.endDate = dayjs().add(4).toDate();

    const productEntity = new Product();
    productEntity.id = 'cdad7290-07c9-4419-a9d7-2c6c843fef51';
    productEntity.userId = 'cdad7290-07c9-4419-a9d7-2c6c843fef50';

    const fieldEntity = new Field();
    fieldEntity.id = uuid();
    fieldEntity.type = FieldType.TEXT;

    const promoSet = new PromoSet();
    promoSet.id = uuid();
    promoSet.days = 7;
    promoSet.price = 200;
    promoSet.name = 'Test';

    const productRepositoryMock = createRepositoryMock<Product>([productEntity]);
    const promoRepositoryMock = createRepositoryMock<Promo>([promo]);
    const fieldRepositoryMock = createRepositoryMock<Field>([fieldEntity]);
    const promoSetRepositoryMock = createRepositoryMock<PromoSet>([promoSet]);

    const JwtGuard = JwtAuthGuardMock;

    beforeAll(async () => {
        let moduleBuilder = Test.createTestingModule({
            imports: [PromoModule],
        });

        const moduleRef = await declareCommonProviders(moduleBuilder)
            .overrideProvider(getRepositoryToken(Promo))
            .useValue(promoRepositoryMock)
            .overrideProvider(getRepositoryToken(Field))
            .useValue(fieldRepositoryMock)
            .overrideProvider(getRepositoryToken(Product))
            .useValue(productRepositoryMock)
            .overrideProvider(getRepositoryToken(PromoSet))
            .useValue(promoSetRepositoryMock)
            .overrideGuard(JwtAuthGuard)
            .useValue(JwtGuard)
            .overrideGuard(ACGuard)
            .useValue(AcGuardMock)
            .overrideGuard(BlockedUserGuard)
            .useValue(BlockedUserGuardMock)
            .compile();

        app = await createTestAppForModule(moduleRef);
    });

    describe('pay promo', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer())
                .post('/promo')
                .send({
                    productId: uuid(),
                    promoSetId: uuid(),
                } as PayPromoDto)
                .expect(HttpStatus.OK);
        });

        it(`with error - wrong props`, () => {
            return request(app.getHttpServer())
                .post('/promo')
                .send({
                    productId: '',
                    promoSetId: '',
                } as PayPromoDto)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('promoSetId must be an UUID');
                    expect(res.body.message).toContain('promoSetId should not be empty');
                    expect(res.body.message).toContain('productId must be an UUID');
                    expect(res.body.message).toContain('productId should not be empty');
                });
        });

        it(`with error for not logged in user`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).post('/promo').send({}).expect(HttpStatus.FORBIDDEN);
        });

        it(`with error not an owner or admin`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '12345', email: 'test@email.com', roles: [RolesEnum.USER] };
                return true;
            });

            return request(app.getHttpServer())
                .post('/promo')
                .send({
                    productId: uuid(),
                    promoSetId: uuid(),
                } as PayPromoDto)
                .expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('get promo products', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).get(`/promo/${uuid()}/products`).expect(HttpStatus.OK);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
