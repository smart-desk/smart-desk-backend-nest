import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { ExecutionContext, HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { v4 as uuid } from 'uuid';
import { Connection } from 'typeorm';
import { AccessControlModule } from 'nest-access-control';
import { createRepositoryMock, createTestAppForModule, declareCommonProviders } from '../../../../test/test.utils';
import { Product } from '../../products/entities/product.entity';
import { ProductsModule } from '../../products/products.module';
import { Field } from '../../fields/field.entity';
import { CreateProductDto } from '../../products/dto/create-product.dto';
import { FieldType } from '../dynamic-fields.module';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { JwtAuthGuardMock } from '../../../../test/mocks/jwt-auth.guard.mock';
import { roles, RolesEnum } from '../../app/app.roles';
import { UsersModule } from '../../users/users.module';
import { User } from '../../users/entities/user.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateProductDto } from '../../products/dto/update-product.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { FieldCreateDto, FieldUpdateDto, SectionType } from '../../fields/dto/field.dto';
import { LocationParamsDto } from './dto/location-params.dto';

describe('Location field', () => {
    let app: INestApplication;

    const fieldEntity = new Field();
    fieldEntity.type = FieldType.LOCATION;
    fieldEntity.id = uuid();
    fieldEntity.title = 'test';
    fieldEntity.params = {};

    const productEntity = new Product();
    productEntity.id = '1234';
    productEntity.userId = '123';

    const productRepositoryMock = createRepositoryMock<Product>([productEntity]);
    const fieldRepositoryMock = createRepositoryMock<Field>([fieldEntity]);
    const connectionMock = {
        manager: createRepositoryMock(),
    };
    const userRepositoryMock = createRepositoryMock<User>([new User()]);
    const JwtGuard = JwtAuthGuardMock;

    beforeAll(async () => {
        let moduleBuilder = Test.createTestingModule({
            imports: [ProductsModule, TypeOrmModule.forRoot(), AccessControlModule.forRoles(roles), UsersModule],
        });

        const moduleRef = await declareCommonProviders(moduleBuilder)
            .overrideProvider(getRepositoryToken(Product))
            .useValue(productRepositoryMock)
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

    describe('Products controller', () => {
        describe('create product', () => {
            it(`successfully`, () => {
                return request(app.getHttpServer())
                    .post(`/products`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some product',
                        fields: [
                            {
                                field_id: uuid(),
                                title: 'test',
                                lat: 13,
                                lng: 123,
                            } as CreateLocationDto,
                        ],
                    } as CreateProductDto)
                    .expect(HttpStatus.CREATED);
            });

            it(`with error - not valid field`, () => {
                return request(app.getHttpServer())
                    .post(`/products`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some product',
                        fields: [
                            {
                                field_id: uuid(),
                                title: 123123,
                                lat: '123123',
                                lng: '123123',
                            } as any,
                        ],
                    } as CreateProductDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('title must be shorter than or equal to 255 characters');
                        expect(res.body.message).toContain('title must be a string');
                        expect(res.body.message).toContain('lat must be a number conforming to the specified constraints');
                        expect(res.body.message).toContain('lng must be a number conforming to the specified constraints');
                    });
            });
        });

        describe('update product', () => {
            it(`successfully`, () => {
                return request(app.getHttpServer())
                    .patch(`/products/${uuid()}`)
                    .send({
                        title: 'some product',
                        fields: [
                            {
                                field_id: uuid(),
                                title: 'test',
                                lat: 13,
                                lng: 123,
                            } as UpdateLocationDto,
                        ],
                    } as UpdateProductDto)
                    .expect(HttpStatus.OK);
            });

            it(`with error not valid field`, () => {
                return request(app.getHttpServer())
                    .patch(`/products/${uuid()}`)
                    .send({
                        title: 'some product',
                        fields: [
                            {
                                field_id: uuid(),
                                title: 123123,
                                lat: '123123',
                                lng: '123123',
                            } as any,
                        ],
                    } as CreateProductDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('title must be shorter than or equal to 255 characters');
                        expect(res.body.message).toContain('title must be a string');
                        expect(res.body.message).toContain('lat must be a number conforming to the specified constraints');
                        expect(res.body.message).toContain('lng must be a number conforming to the specified constraints');
                    });
            });
        });
    });

    describe('Fields controller', () => {
        describe('create field', () => {
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
                        section: SectionType.LOCATION,
                        title: 'some title',
                        type: FieldType.LOCATION,
                        params: {} as LocationParamsDto,
                    } as FieldCreateDto)
                    .expect(HttpStatus.CREATED);
            });
        });

        describe('update field', () => {
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
                        type: FieldType.LOCATION,
                        params: {} as UpdateLocationDto,
                    } as FieldUpdateDto)
                    .expect(HttpStatus.OK);
            });
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
