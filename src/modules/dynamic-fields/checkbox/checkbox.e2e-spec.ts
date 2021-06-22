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
import { UpdateProductDto } from '../../products/dto/update-product.dto';
import { FieldCreateDto, FieldUpdateDto, SectionType } from '../../fields/dto/field.dto';
import { CreateCheckboxDto } from './dto/create-checkbox.dto';
import { UpdateCheckboxDto } from './dto/update-checkbox.dto';
import { CheckboxParamsDto } from './dto/checkbox-params.dto';

describe('Checkbox field', () => {
    let app: INestApplication;

    const fieldEntity = new Field();
    fieldEntity.type = FieldType.CHECKBOX;
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
                                productId: null,
                                field_id: uuid(),
                                title: 'test',
                                value: ['test', 'test1'],
                            } as CreateCheckboxDto,
                        ],
                    } as CreateProductDto)
                    .expect(HttpStatus.CREATED);
            });

            it(`with error - value is not array`, () => {
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
                                value: 'a234132',
                            } as any,
                        ],
                    } as CreateProductDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('value must be an array');
                    });
            });

            it(`with error - not valid value values`, () => {
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
                                value: [1234, 3413],
                            } as any,
                        ],
                    } as CreateProductDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('each value in value must be shorter than or equal to 255 characters');
                        expect(res.body.message).toContain('each value in value must be a string');
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
                                id: uuid(),
                                field_id: uuid(),
                                title: 'test',
                                value: ['123'],
                            } as UpdateCheckboxDto,
                        ],
                    } as UpdateProductDto)
                    .expect(HttpStatus.OK);
            });

            it(`with error not valid value`, () => {
                return request(app.getHttpServer())
                    .patch(`/products/${uuid()}`)
                    .send({
                        title: 'some product',
                        fields: [
                            {
                                field_id: uuid(),
                                title: 123123,
                                value: 'a234132',
                            } as any,
                        ],
                    } as CreateProductDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('value must be an array');
                    });
            });

            it(`with error not value values`, () => {
                return request(app.getHttpServer())
                    .patch(`/products/${uuid()}`)
                    .send({
                        title: 'some product',
                        fields: [
                            {
                                field_id: uuid(),
                                title: 123123,
                                value: [1234, 3413],
                            } as any,
                        ],
                    } as CreateProductDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('each value in value must be shorter than or equal to 255 characters');
                        expect(res.body.message).toContain('each value in value must be a string');
                    });
            });
        });
    });

    describe('Fields controller', () => {
        describe('create checkbox field', () => {
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
                        section: SectionType.PARAMS,
                        title: 'some title',
                        type: FieldType.CHECKBOX,
                        params: {
                            checkboxes: [
                                {
                                    label: 'test',
                                    value: 'test',
                                },
                            ],
                        } as CheckboxParamsDto,
                    } as FieldCreateDto)
                    .expect(HttpStatus.CREATED);
            });

            it(`with error - not valid params`, () => {
                JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                    const req = context.switchToHttp().getRequest();
                    req.user = { id: '007', email: 'test@email.com', roles: [RolesEnum.USER, RolesEnum.ADMIN] };
                    return true;
                });

                return request(app.getHttpServer())
                    .post('/fields')
                    .send({
                        modelId: uuid(),
                        section: SectionType.PARAMS,
                        title: 'some title',
                        type: FieldType.CHECKBOX,
                        params: {
                            checkboxes: [
                                {
                                    label: null,
                                    value: 213412,
                                },
                            ],
                        } as any,
                    } as FieldCreateDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('label must be shorter than or equal to 255 characters');
                        expect(res.body.message).toContain('label must be a string');
                        expect(res.body.message).toContain('label should not be empty');
                        expect(res.body.message).toContain('value must be shorter than or equal to 255 characters');
                        expect(res.body.message).toContain('value must be a string');
                    });
            });
        });

        describe('update checkbox field', () => {
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
                        type: FieldType.CHECKBOX,
                        params: {
                            checkboxes: [
                                {
                                    label: 'test',
                                    value: 'test',
                                },
                            ],
                        } as CheckboxParamsDto,
                    } as FieldUpdateDto)
                    .expect(HttpStatus.OK);
            });

            it(`with error - not valid params`, () => {
                JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                    const req = context.switchToHttp().getRequest();
                    req.user = { id: '007', email: 'test@email.com', roles: [RolesEnum.USER, RolesEnum.ADMIN] };
                    return true;
                });

                return request(app.getHttpServer())
                    .put(`/fields/${uuid()}`)
                    .send({
                        title: 'some title',
                        type: FieldType.CHECKBOX,
                        params: {
                            checkboxes: [
                                {
                                    label: null,
                                    value: 213412,
                                },
                            ],
                        } as any,
                    } as FieldCreateDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('label must be shorter than or equal to 255 characters');
                        expect(res.body.message).toContain('label must be a string');
                        expect(res.body.message).toContain('label should not be empty');
                        expect(res.body.message).toContain('value must be shorter than or equal to 255 characters');
                        expect(res.body.message).toContain('value must be a string');
                    });
            });
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
