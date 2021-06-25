import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
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
import { roles } from '../../app/app.roles';
import { UsersModule } from '../../users/users.module';
import { User } from '../../users/entities/user.entity';
import { UpdateProductDto } from '../../products/dto/update-product.dto';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';

describe('Photo field', () => {
    let app: INestApplication;

    const fieldEntity = new Field();
    fieldEntity.type = FieldType.PHOTO;
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
            const photoField = new Field();
            photoField.type = FieldType.PHOTO;

            it(`successfully`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(photoField);
                return request(app.getHttpServer())
                    .post(`/products`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some product',
                        fields: [
                            {
                                fieldId: uuid(),
                                value: ['http://text.com/some-picture.png'],
                            } as CreatePhotoDto,
                        ],
                    } as CreateProductDto)
                    .expect(HttpStatus.CREATED);
            });

            it(`with error - not valid fieldId`, () => {
                return request(app.getHttpServer())
                    .post(`/products`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some product',
                        fields: [
                            {
                                fieldId: '123',
                                value: ['http://text.com/some-picture.png'],
                            } as CreatePhotoDto,
                        ],
                    } as CreateProductDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('fieldId must be an UUID');
                    });
            });

            it(`with error - not valid value`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(photoField);
                return request(app.getHttpServer())
                    .post(`/products`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some product',
                        fields: [
                            {
                                fieldId: uuid(),
                                value: ['test'],
                            } as CreatePhotoDto,
                        ],
                    } as CreateProductDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('value must be url to image');
                        expect(res.body.message).toContain('each value in value must be an URL address');
                    });
            });

            it(`with error - value is more than 1000 symbols`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(photoField);
                return request(app.getHttpServer())
                    .post(`/products`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some product',
                        fields: [
                            {
                                fieldId: uuid(),
                                value: ['http://domain.com/' + Array(1001).fill('a').join('') + '.png'],
                            } as CreatePhotoDto,
                        ],
                    } as CreateProductDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('each value in value must be shorter than or equal to 1000 characters');
                    });
            });
        });

        describe('update product with photo field', () => {
            const field = new Field();
            field.type = FieldType.PHOTO;

            it(`successfully`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(field);
                return request(app.getHttpServer())
                    .patch(`/products/${uuid()}`)
                    .send({
                        title: 'some product',
                        fields: [
                            {
                                id: uuid(),
                                fieldId: uuid(),
                                value: ['http://text.com/some-picture.png'],
                            } as UpdatePhotoDto,
                        ],
                    } as UpdateProductDto)
                    .expect(HttpStatus.OK);
            });

            it(`with error - not valid id`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(field);
                return request(app.getHttpServer())
                    .patch(`/products/${uuid()}`)
                    .send({
                        title: 'some product',
                        fields: [
                            {
                                id: '12312312',
                                fieldId: uuid(),
                                value: ['http://text.com/some-picture.png'],
                            } as UpdatePhotoDto,
                        ],
                    } as UpdateProductDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('id must be an UUID');
                    });
            });

            it(`with error - not valid fieldId`, () => {
                return request(app.getHttpServer())
                    .patch(`/products/${uuid()}`)
                    .send({
                        title: 'some product',
                        fields: [
                            {
                                id: uuid(),
                                fieldId: '123',
                                value: ['http://text.com/some-picture.png'],
                            } as UpdatePhotoDto,
                        ],
                    } as UpdateProductDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('fieldId must be an UUID');
                    });
            });

            it(`with error - not valid value`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(field);
                return request(app.getHttpServer())
                    .patch(`/products/${uuid()}`)
                    .send({
                        title: 'some product',
                        fields: [
                            {
                                fieldId: uuid(),
                                value: ['test'],
                            } as UpdatePhotoDto,
                        ],
                    } as UpdateProductDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('value must be url to image');
                        expect(res.body.message).toContain('each value in value must be an URL address');
                    });
            });

            it(`with error - value is more than 1000 symbols`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(field);
                return request(app.getHttpServer())
                    .patch(`/products/${uuid()}`)
                    .send({
                        title: 'some product',
                        fields: [
                            {
                                id: uuid(),
                                fieldId: uuid(),
                                value: ['http://domain.com/' + Array(1001).fill('a').join('') + '.png'],
                            } as UpdatePhotoDto,
                        ],
                    } as UpdateProductDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('each value in value must be shorter than or equal to 1000 characters');
                    });
            });

            it(`successfully with new photo field`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(field);
                return request(app.getHttpServer())
                    .patch(`/products/${uuid()}`)
                    .send({
                        title: 'some product',
                        fields: [
                            {
                                id: null,
                                fieldId: uuid(),
                                value: ['http://domain.com/ssdsds.png'],
                            } as UpdatePhotoDto,
                        ],
                    } as UpdateProductDto)
                    .expect(HttpStatus.OK);
            });
        });
    });

    describe('Fields controller', () => {
        // todo add tests
    });

    afterAll(async () => {
        await app.close();
    });
});
