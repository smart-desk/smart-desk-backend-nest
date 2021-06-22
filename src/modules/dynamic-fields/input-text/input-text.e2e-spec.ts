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
import { CreateInputTextDto } from './dto/create-input-text.dto';
import { UpdateInputTextDto } from './dto/update-input-text.dto';
import { InputTextParamsDto } from './dto/input-text-params.dto';

describe('Input text field', () => {
    let app: INestApplication;

    const fieldEntity = new Field();
    fieldEntity.type = FieldType.INPUT_TEXT;
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
                                value: 'test',
                            } as CreateInputTextDto,
                        ],
                    } as CreateProductDto)
                    .expect(HttpStatus.CREATED);
            });

            it(`with error - not valid field_id`, () => {
                return request(app.getHttpServer())
                    .post(`/products`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some product',
                        fields: [
                            {
                                field_id: '123',
                                value: '',
                            } as CreateInputTextDto,
                        ],
                    } as CreateProductDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('field_id must be an UUID');
                    });
            });

            it(`with error - not valid value`, () => {
                return request(app.getHttpServer())
                    .post(`/products`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some product',
                        fields: [
                            {
                                field_id: uuid(),
                                value: '',
                            } as CreateInputTextDto,
                        ],
                    } as CreateProductDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('value should not be empty');
                    });
            });
        });

        describe('update product with input_text field', () => {
            it(`successfully`, () => {
                return request(app.getHttpServer())
                    .patch(`/products/${uuid()}`)
                    .send({
                        title: 'some product',
                        fields: [
                            {
                                id: uuid(),
                                field_id: uuid(),
                                value: 'new text',
                            } as UpdateInputTextDto,
                        ],
                    } as UpdateProductDto)
                    .expect(HttpStatus.OK);
            });

            it(`with error - not valid field_id`, () => {
                return request(app.getHttpServer())
                    .patch(`/products/${uuid()}`)
                    .send({
                        title: 'some product',
                        fields: [
                            {
                                id: uuid(),
                                field_id: '123',
                                value: 'new text',
                            } as UpdateInputTextDto,
                        ],
                    } as UpdateProductDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('field_id must be an UUID');
                    });
            });

            it(`with error - not valid value`, () => {
                return request(app.getHttpServer())
                    .patch(`/products/${uuid()}`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some product',
                        fields: [
                            {
                                id: uuid(),
                                field_id: uuid(),
                                value: '',
                            } as UpdateInputTextDto,
                        ],
                    } as UpdateProductDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('value should not be empty');
                    });
            });

            it(`with error - value is too long`, () => {
                return request(app.getHttpServer())
                    .patch(`/products/${uuid()}`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some product',
                        fields: [
                            {
                                id: uuid(),
                                field_id: uuid(),
                                value: Array(300).fill('a').join(''),
                            } as UpdateInputTextDto,
                        ],
                    } as UpdateProductDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('value must be shorter than or equal to 255 characters');
                    });
            });

            it(`with error - id is not valid`, () => {
                return request(app.getHttpServer())
                    .patch(`/products/${uuid()}`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some product',
                        fields: [
                            {
                                id: '123',
                                field_id: uuid(),
                                value: '1234',
                            } as UpdateInputTextDto,
                        ],
                    } as UpdateProductDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('id must be an UUID');
                    });
            });

            it(`with error - field not found`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(undefined);

                return request(app.getHttpServer())
                    .patch(`/products/${uuid()}`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some product',
                        fields: [
                            {
                                id: uuid(),
                                field_id: uuid(),
                                value: '1234',
                            } as UpdateInputTextDto,
                        ],
                    } as UpdateProductDto)
                    .expect(HttpStatus.NOT_FOUND)
                    .expect(res => {
                        expect(res.body.message).toContain('Field not found');
                    });
            });
        });
    });

    describe('Fields controller', () => {
        describe('create input_text field', () => {
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
                        type: FieldType.INPUT_TEXT,
                        params: {
                            placeholder: 'some place',
                        } as InputTextParamsDto,
                    } as FieldCreateDto)
                    .expect(HttpStatus.CREATED);
            });
        });

        describe('update input_text field', () => {
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
                        type: FieldType.INPUT_TEXT,
                        params: {
                            placeholder: 'some place',
                        } as InputTextParamsDto,
                    } as FieldUpdateDto)
                    .expect(HttpStatus.OK);
            });
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
