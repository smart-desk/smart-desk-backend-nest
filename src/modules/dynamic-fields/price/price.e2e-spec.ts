import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { ExecutionContext, HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { v4 as uuid } from 'uuid';
import { Connection } from 'typeorm';
import { AccessControlModule } from 'nest-access-control';
import { createRepositoryMock, createTestAppForModule, declareCommonProviders } from '../../../../test/test.utils';
import { Advert } from '../../adverts/entities/advert.entity';
import { AdvertsModule } from '../../adverts/adverts.module';
import { Field } from '../../fields/field.entity';
import { CreateAdvertDto } from '../../adverts/dto/create-advert.dto';
import { FieldType } from '../dynamic-fields.module';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { JwtAuthGuardMock } from '../../../../test/mocks/jwt-auth.guard.mock';
import { roles, RolesEnum } from '../../app/app.roles';
import { UsersModule } from '../../users/users.module';
import { User } from '../../users/entities/user.entity';
import { UpdateAdvertDto } from '../../adverts/dto/update-advert.dto';
import { FieldCreateDto, FieldUpdateDto, SectionType } from '../../fields/dto/field.dto';
import { CreatePriceDto } from './dto/create-price.dto';
import { UpdatePriceDto } from './dto/update-price.dto';
import { PriceParamsDto } from './dto/price-params.dto';

describe('Price field', () => {
    let app: INestApplication;

    const fieldEntity = new Field();
    fieldEntity.type = FieldType.PRICE;
    fieldEntity.id = uuid();
    fieldEntity.title = 'test';
    fieldEntity.params = {};

    const advertEntity = new Advert();
    advertEntity.id = '1234';
    advertEntity.userId = '123';

    const advertRepositoryMock = createRepositoryMock<Advert>([advertEntity]);
    const fieldRepositoryMock = createRepositoryMock<Field>([fieldEntity]);
    const connectionMock = {
        manager: createRepositoryMock(),
    };
    const userRepositoryMock = createRepositoryMock<User>([new User()]);
    const JwtGuard = JwtAuthGuardMock;

    beforeAll(async () => {
        let moduleBuilder = Test.createTestingModule({
            imports: [AdvertsModule, TypeOrmModule.forRoot(), AccessControlModule.forRoles(roles), UsersModule],
        });

        const moduleRef = await declareCommonProviders(moduleBuilder)
            .overrideProvider(getRepositoryToken(Advert))
            .useValue(advertRepositoryMock)
            .overrideProvider(getRepositoryToken(Field))
            .useValue(fieldRepositoryMock)
            .overrideProvider(getRepositoryToken(User))
            .useValue(userRepositoryMock)
            .overrideProvider(Connection)
            .useValue(connectionMock)
            .overrideGuard(JwtAuthGuard)
            .useValue(JwtGuard)
            .compile();

        app = await createTestAppForModule(moduleRef);
    });

    describe('Adverts controller', () => {
        describe('create advert', () => {
            const photoField = new Field();
            photoField.type = FieldType.PRICE;

            it(`successfully`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(photoField);
                return request(app.getHttpServer())
                    .post(`/adverts`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some advert',
                        fields: [
                            {
                                field_id: uuid(),
                                value: 1000,
                            } as CreatePriceDto,
                        ],
                    } as CreateAdvertDto)
                    .expect(HttpStatus.CREATED);
            });

            it(`with error - not valid field_id`, () => {
                return request(app.getHttpServer())
                    .post(`/adverts`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some advert',
                        fields: [
                            {
                                field_id: '123',
                                value: 1000,
                            } as CreatePriceDto,
                        ],
                    } as CreateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('field_id must be an UUID');
                    });
            });

            it(`with error - not valid value`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(photoField);
                return request(app.getHttpServer())
                    .post(`/adverts`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some advert',
                        fields: [
                            {
                                field_id: uuid(),
                                value: -100,
                            } as CreatePriceDto,
                        ],
                    } as CreateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('value must be a positive number');
                    });
            });
        });

        describe('update advert', () => {
            const field = new Field();
            field.type = FieldType.PRICE;

            it(`successfully`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(field);
                return request(app.getHttpServer())
                    .patch(`/adverts/${uuid()}`)
                    .send({
                        title: 'some advert',
                        fields: [
                            {
                                id: uuid(),
                                field_id: uuid(),
                                value: 1000,
                            } as UpdatePriceDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.OK);
            });

            it(`with error - not valid id`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(field);
                return request(app.getHttpServer())
                    .patch(`/adverts/${uuid()}`)
                    .send({
                        title: 'some advert',
                        fields: [
                            {
                                id: '12312312',
                                field_id: uuid(),
                                value: 1000,
                            } as UpdatePriceDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('id must be an UUID');
                    });
            });

            it(`with error - not valid field_id`, () => {
                return request(app.getHttpServer())
                    .patch(`/adverts/${uuid()}`)
                    .send({
                        title: 'some advert',
                        fields: [
                            {
                                id: uuid(),
                                field_id: '123',
                                value: 1000,
                            } as UpdatePriceDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('field_id must be an UUID');
                    });
            });

            it(`with error - not valid value`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(field);
                return request(app.getHttpServer())
                    .patch(`/adverts/${uuid()}`)
                    .send({
                        title: 'some advert',
                        fields: [
                            {
                                field_id: uuid(),
                                value: -1000,
                            } as UpdatePriceDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('value must be a positive number');
                    });
            });

            it(`successfully with new photo field`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(field);
                return request(app.getHttpServer())
                    .patch(`/adverts/${uuid()}`)
                    .send({
                        title: 'some advert',
                        fields: [
                            {
                                id: null,
                                field_id: uuid(),
                                value: 1000,
                            } as UpdatePriceDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.OK);
            });
        });
    });

    describe('Fields controller', () => {
        describe('create price field', () => {
            it(`successfully`, () => {
                JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                    const req = context.switchToHttp().getRequest();
                    req.user = { id: '007', email: 'test@email.com', roles: [RolesEnum.USER, RolesEnum.ADMIN] };
                    return true;
                });

                return request(app.getHttpServer())
                    .post('/fields')
                    .send({
                        modelId: uuid(),
                        section: SectionType.PRICE,
                        title: 'some title',
                        type: FieldType.PRICE,
                        params: {
                            currency: 'USD',
                        } as PriceParamsDto,
                    } as FieldCreateDto)
                    .expect(HttpStatus.CREATED);
            });

            it(`with errors - not empty, must be a string and shorter then 10`, () => {
                JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                    const req = context.switchToHttp().getRequest();
                    req.user = { id: '007', email: 'test@email.com', roles: [RolesEnum.USER, RolesEnum.ADMIN] };
                    return true;
                });

                return request(app.getHttpServer())
                    .post('/fields')
                    .send({
                        modelId: uuid(),
                        section: SectionType.PRICE,
                        title: 'some title',
                        type: FieldType.PRICE,
                        params: {
                            currency: null,
                        } as PriceParamsDto,
                    } as FieldCreateDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('currency must be a string');
                        expect(res.body.message).toContain('currency should not be empty');
                        expect(res.body.message).toContain('currency must be shorter than or equal to 10 characters');
                    });
            });
        });

        describe('update price field', () => {
            it(`successfully`, () => {
                JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                    const req = context.switchToHttp().getRequest();
                    req.user = { id: '007', email: 'test@email.com', roles: [RolesEnum.USER, RolesEnum.ADMIN] };
                    return true;
                });

                return request(app.getHttpServer())
                    .put(`/fields/${uuid()}`)
                    .send({
                        title: 'some title',
                        type: FieldType.PRICE,
                        params: { currency: 'USD' } as PriceParamsDto,
                    } as FieldUpdateDto)
                    .expect(HttpStatus.OK);
            });

            it(`with errors - not empty, must be a string and shorter then 10`, () => {
                // todo make util for that
                JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                    const req = context.switchToHttp().getRequest();
                    req.user = { id: '007', email: 'test@email.com', roles: [RolesEnum.USER, RolesEnum.ADMIN] };
                    return true;
                });

                return request(app.getHttpServer())
                    .put(`/fields/${uuid()}`)
                    .send({
                        title: 'some title',
                        type: FieldType.PRICE,
                        params: { currency: null } as PriceParamsDto,
                    } as FieldUpdateDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('currency must be a string');
                        expect(res.body.message).toContain('currency should not be empty');
                        expect(res.body.message).toContain('currency must be shorter than or equal to 10 characters');
                    });
            });
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
