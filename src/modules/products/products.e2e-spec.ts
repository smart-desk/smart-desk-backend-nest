import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { ExecutionContext, HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { v4 as uuid } from 'uuid';
import { Connection } from 'typeorm';
import { AccessControlModule, ACGuard } from 'nest-access-control';
import { createRepositoryMock, createTestAppForModule, declareCommonProviders } from '../../../test/test.utils';
import { Product } from './entities/product.entity';
import { ProductsModule } from './products.module';
import { Field } from '../fields/field.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FieldType } from '../dynamic-fields/dynamic-fields.module';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { JwtAuthGuardMock } from '../../../test/mocks/jwt-auth.guard.mock';
import { AcGuardMock } from '../../../test/mocks/ac.guard.mock';
import { roles } from '../app/app.roles';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';
import { UserStatus } from '../users/models/user-status.enum';
import { BlockedUserGuard } from '../../guards/blocked-user.guard';
import { BlockedUserGuardMock } from '../../../test/mocks/blocked-user.guard.mock';
import { PreferContact } from './models/prefer-contact.enum';

describe('Products controller', () => {
    let app: INestApplication;

    const fieldEntity = new Field();
    fieldEntity.type = FieldType.INPUT_TEXT;
    fieldEntity.id = uuid();
    fieldEntity.title = 'test';
    fieldEntity.params = { label: 'Test', placeholder: 'test', required: true };

    const productEntity = new Product();
    productEntity.id = '1234';
    productEntity.userId = '123';

    const productRepositoryMock = createRepositoryMock<Product>([productEntity]);
    const fieldRepositoryMock = createRepositoryMock<Field>([fieldEntity]);
    const connectionMock = {
        manager: createRepositoryMock(),
    };

    beforeAll(async () => {
        let moduleBuilder = await Test.createTestingModule({
            imports: [ProductsModule, TypeOrmModule.forRoot()],
        });

        const moduleRef = await declareCommonProviders(moduleBuilder)
            .overrideProvider(getRepositoryToken(Product))
            .useValue(productRepositoryMock)
            .overrideProvider(getRepositoryToken(Field))
            .useValue(fieldRepositoryMock)
            .overrideProvider(Connection)
            .useValue(connectionMock)
            .overrideGuard(JwtAuthGuard)
            .useValue(JwtAuthGuardMock)
            .overrideGuard(ACGuard)
            .useValue(AcGuardMock)
            .overrideGuard(BlockedUserGuard)
            .useValue(BlockedUserGuardMock)
            .compile();

        app = await createTestAppForModule(moduleRef);
    });

    describe('get products', () => {
        it(`successfully with no params`, () => {
            return request(app.getHttpServer())
                .get('/products')
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.products).toBeDefined();
                    expect(res.body.limit).toEqual(20);
                    expect(res.body.totalCount).toEqual(1);
                    expect(res.body.page).toEqual(1);
                });
        });

        it(`successfully with page, limit, search and category`, () => {
            return request(app.getHttpServer())
                .get('/products')
                .query({
                    page: 2,
                    limit: 2,
                    category_id: uuid(),
                    search: 'test',
                })
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.products).toBeDefined();
                    expect(res.body.limit).toEqual(2);
                    expect(res.body.totalCount).toEqual(1);
                    expect(res.body.page).toEqual(2);
                });
        });

        it(`with error - not valid page`, () => {
            return request(app.getHttpServer())
                .get('/products')
                .query({ page: 0 })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('page must be a positive number');
                });
        });

        it(`with error - not valid limit, no negative numbers`, () => {
            return request(app.getHttpServer())
                .get('/products')
                .query({ limit: -1 })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('limit must be a positive number');
                });
        });

        it(`with error - not valid limit, no greater than 100`, () => {
            return request(app.getHttpServer())
                .get('/products')
                .query({ limit: 300 })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('limit must not be greater than 100');
                });
        });

        it(`with error - not valid search`, () => {
            return request(app.getHttpServer())
                .get('/products')
                .query({ search: Array(300).fill('a').join('') })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('search must be shorter than or equal to 255 characters');
                });
        });

        it(`successfully with filters`, () => {
            return request(app.getHttpServer())
                .get(`/products?filters[${uuid()}][from]=100&filters[${uuid()}][to]=500`)
                .expect(HttpStatus.OK);
        });

        it(`with error - invalid filters format`, () => {
            return request(app.getHttpServer())
                .get(`/products?filters=1000`)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('filters must be an object');
                });
        });

        it(`successfully with sorting`, () => {
            return request(app.getHttpServer()).get(`/products?sorting[${uuid()}]=ASC`).expect(HttpStatus.OK);
        });

        it(`with error - invalid sorting format`, () => {
            return request(app.getHttpServer())
                .get(`/products?sorting=1000`)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('sorting must be an object');
                });
        });

        it(`successfully with user id`, () => {
            return request(app.getHttpServer()).get(`/products?user=${uuid()}`).expect(HttpStatus.OK);
        });

        it(`with error - user uuid is not valid`, () => {
            return request(app.getHttpServer())
                .get(`/products?user=1000`)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('user must be an UUID');
                });
        });
    });

    describe('get products for category', () => {
        it(`successfully with no params`, () => {
            return request(app.getHttpServer())
                .get(`/products/category/${uuid()}`)
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.products).toBeDefined();
                    expect(res.body.limit).toEqual(20);
                    expect(res.body.totalCount).toEqual(1);
                    expect(res.body.page).toEqual(1);
                });
        });

        it(`successfully with page, limit, search`, () => {
            return request(app.getHttpServer())
                .get(`/products/category/${uuid()}`)
                .query({
                    page: 2,
                    limit: 2,
                    search: 'test',
                })
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.products).toBeDefined();
                    expect(res.body.limit).toEqual(2);
                    expect(res.body.totalCount).toEqual(1);
                    expect(res.body.page).toEqual(2);
                });
        });

        it(`with error - not valid category id`, () => {
            return request(app.getHttpServer())
                .get(`/products/category/13244`)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('Validation failed (uuid  is expected)');
                });
        });

        it(`with error - not valid page`, () => {
            return request(app.getHttpServer())
                .get(`/products/category/${uuid()}`)
                .query({ page: 0 })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('page must be a positive number');
                });
        });

        it(`with error - not valid limit, no negative numbers`, () => {
            return request(app.getHttpServer())
                .get(`/products/category/${uuid()}`)
                .query({ limit: -1 })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('limit must be a positive number');
                });
        });

        it(`with error - not valid limit, no greater than 100`, () => {
            return request(app.getHttpServer())
                .get(`/products/category/${uuid()}`)
                .query({ limit: 300 })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('limit must not be greater than 100');
                });
        });

        it(`with error - not valid search`, () => {
            return request(app.getHttpServer())
                .get(`/products/category/${uuid()}`)
                .query({ search: Array(300).fill('a').join('') })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('search must be shorter than or equal to 255 characters');
                });
        });

        it(`successfully with filters`, () => {
            return request(app.getHttpServer())
                .get(`/products/category/${uuid()}?filters[${uuid()}][from]=100&filters[${uuid()}][to]=500`)
                .expect(HttpStatus.OK);
        });

        it(`with error - invalid filters format`, () => {
            return request(app.getHttpServer())
                .get(`/products/category/${uuid()}?filters=1000`)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('filters must be an object');
                });
        });

        it(`successfully with sorting`, () => {
            return request(app.getHttpServer()).get(`/products/category/${uuid()}?sorting[${uuid()}]=ASC`).expect(HttpStatus.OK);
        });

        it(`with error - invalid sorting format`, () => {
            return request(app.getHttpServer())
                .get(`/products/category/${uuid()}?sorting=1000`)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('sorting must be an object');
                });
        });

        it(`successfully with user id`, () => {
            return request(app.getHttpServer()).get(`/products/category/${uuid()}?user=${uuid()}`).expect(HttpStatus.OK);
        });

        it(`with error - user uuid is not valid`, () => {
            return request(app.getHttpServer())
                .get(`/products/category/${uuid()}?user=1000`)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('user must be an UUID');
                });
        });
    });

    describe('get product by id', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).get(`/products/${uuid()}`).expect(HttpStatus.OK);
        });

        it(`with error - not valid uuid`, () => {
            return request(app.getHttpServer())
                .get('/products/123123')
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('Validation failed (uuid  is expected)');
                });
        });

        it(`with error - not found`, () => {
            productRepositoryMock.findOne.mockReturnValueOnce(undefined);
            return request(app.getHttpServer()).get(`/products/${uuid()}`).expect(HttpStatus.NOT_FOUND);
        });
    });

    describe('get recommended products by id', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).get(`/products/${uuid()}/recommended`).expect(HttpStatus.OK);
        });

        it(`with error - not valid uuid`, () => {
            return request(app.getHttpServer())
                .get('/products/123123/recommended')
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('Validation failed (uuid  is expected)');
                });
        });

        it(`with error - not found`, () => {
            productRepositoryMock.findOne.mockReturnValueOnce(undefined);
            return request(app.getHttpServer()).get(`/products/${uuid()}/recommended`).expect(HttpStatus.NOT_FOUND);
        });
    });

    describe('create product', () => {
        it(`successfully with empty fields array`, () => {
            return request(app.getHttpServer())
                .post(`/products`)
                .send({
                    model_id: uuid(),
                    category_id: uuid(),
                    title: 'some product',
                    preferContact: PreferContact.PHONE,
                    fields: [],
                } as CreateProductDto)
                .expect(HttpStatus.CREATED);
        });

        it(`with error - not valid product params`, () => {
            return request(app.getHttpServer())
                .post(`/products`)
                .send({
                    model_id: '12312',
                    category_id: '123123',
                    title: '',
                    preferContact: 'left' as PreferContact,
                    fields: [],
                } as CreateProductDto)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('category_id must be an UUID');
                    expect(res.body.message).toContain('model_id must be an UUID');
                    expect(res.body.message).toContain('title should not be empty');
                    expect(res.body.message).toContain('preferContact must be a valid enum value');
                });
        });

        it(`with error - not valid fields property`, () => {
            return request(app.getHttpServer())
                .post(`/products`)
                .send({
                    model_id: '12312',
                    category_id: '123123',
                    title: '',
                } as CreateProductDto)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('fields must be an array');
                    expect(res.body.message).toContain('fields should not be empty');
                });
        });

        it(`with error - title cannot be longer than 255 characters`, () => {
            return request(app.getHttpServer())
                .post(`/products`)
                .send({
                    model_id: uuid(),
                    category_id: uuid(),
                    title: Array(300).fill('a').join(''),
                    fields: [],
                } as CreateProductDto)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('title must be shorter than or equal to 255 characters');
                });
        });
    });

    describe('update product', () => {
        it(`successfully with empty fields array`, () => {
            return request(app.getHttpServer())
                .patch(`/products/${uuid()}`)
                .send({
                    title: 'some product',
                    fields: [],
                } as UpdateProductDto)
                .expect(HttpStatus.OK);
        });

        it(`with error - not found`, () => {
            productRepositoryMock.findOne.mockReturnValueOnce(undefined);
            return request(app.getHttpServer())
                .patch(`/products/${uuid()}`)
                .send({
                    title: '123123',
                    fields: [],
                } as UpdateProductDto)
                .expect(HttpStatus.NOT_FOUND);
        });

        it(`with error - not valid id`, () => {
            return request(app.getHttpServer())
                .patch(`/products/123`)
                .send({
                    title: '123123',
                    fields: [],
                } as UpdateProductDto)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('Validation failed (uuid  is expected)');
                });
        });

        it(`with error - not valid fields property`, () => {
            return request(app.getHttpServer())
                .patch(`/products/${uuid()}`)
                .send({
                    title: '',
                } as UpdateProductDto)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('fields must be an array');
                    expect(res.body.message).toContain('fields should not be empty');
                });
        });

        it(`with error - title cannot be longer than 255 characters`, () => {
            return request(app.getHttpServer())
                .patch(`/products/${uuid()}`)
                .send({
                    title: Array(300).fill('a').join(''),
                    fields: [],
                } as UpdateProductDto)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('title must be shorter than or equal to 255 characters');
                });
        });
    });

    describe('delete product by id', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).delete(`/products/${uuid()}`).expect(HttpStatus.NO_CONTENT);
        });

        it(`with error - not valid uuid`, () => {
            return request(app.getHttpServer())
                .delete('/products/123123')
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('Validation failed (uuid  is expected)');
                });
        });

        it(`with error - not found`, () => {
            productRepositoryMock.findOne.mockReturnValueOnce(undefined);
            return request(app.getHttpServer()).delete(`/products/${uuid()}`).expect(HttpStatus.NOT_FOUND);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});

// todo put it together
describe('Products controller with ACL enabled', () => {
    let app: INestApplication;

    const fieldEntity = new Field();
    fieldEntity.type = FieldType.INPUT_TEXT;
    fieldEntity.id = uuid();
    fieldEntity.title = 'test';
    fieldEntity.params = { label: 'Test', placeholder: 'test', required: true };

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

    describe('get products', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).get('/products').expect(HttpStatus.OK);
        });
    });

    describe('get product by id', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).get(`/products/${uuid()}`).expect(HttpStatus.OK);
        });
    });

    describe('get my products', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer())
                .get('/products/my')
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.products).toBeDefined();
                    expect(res.body.limit).toEqual(20);
                    expect(res.body.totalCount).toEqual(1);
                    expect(res.body.page).toEqual(1);
                });
        });

        it(`with error - not authorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).get('/products/my').expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('get blocked products', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer())
                .get('/products/blocked')
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.products).toBeDefined();
                    expect(res.body.limit).toEqual(20);
                    expect(res.body.totalCount).toEqual(1);
                    expect(res.body.page).toEqual(1);
                });
        });

        it(`with error - not authorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).get('/products/blocked').expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('get pending products', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer())
                .get('/products/pending')
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.products).toBeDefined();
                    expect(res.body.limit).toEqual(20);
                    expect(res.body.totalCount).toEqual(1);
                    expect(res.body.page).toEqual(1);
                });
        });

        it(`with error - not authorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).get('/products/pending').expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('get completed products', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer())
                .get('/products/completed')
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.products).toBeDefined();
                    expect(res.body.limit).toEqual(20);
                    expect(res.body.totalCount).toEqual(1);
                    expect(res.body.page).toEqual(1);
                });
        });

        it(`with error - not authorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).get('/products/completed').expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('count product view', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).post(`/products/${uuid()}/view`).expect(HttpStatus.OK);
        });
    });

    describe('create product', () => {
        it(`successfully `, () => {
            return request(app.getHttpServer())
                .post(`/products`)
                .send({
                    model_id: uuid(),
                    category_id: uuid(),
                    title: 'some product',
                    fields: [],
                } as CreateProductDto)
                .expect(HttpStatus.CREATED);
        });

        it(`with error - not owner of product`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);

            return request(app.getHttpServer())
                .post(`/products`)
                .send({
                    model_id: '12312',
                    category_id: '123123',
                    title: '',
                    fields: [],
                } as CreateProductDto)
                .expect(HttpStatus.FORBIDDEN);
        });

        it(`with error - user is blocked`, () => {
            const user = new User();
            user.status = UserStatus.BLOCKED;
            userRepositoryMock.findOne.mockReturnValueOnce(user);

            return request(app.getHttpServer())
                .post(`/products`)
                .send({
                    model_id: '12312',
                    category_id: '123123',
                    title: '',
                    fields: [],
                } as CreateProductDto)
                .expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('update product', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer())
                .patch(`/products/${uuid()}`)
                .send({
                    title: 'some product',
                    fields: [],
                } as UpdateProductDto)
                .expect(HttpStatus.OK);
        });

        it(`with error - not owner of product`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user'] };
                return true;
            });

            return request(app.getHttpServer())
                .patch(`/products/${uuid()}`)
                .send({
                    title: '123123',
                    fields: [],
                } as UpdateProductDto)
                .expect(HttpStatus.FORBIDDEN);
        });

        it(`with error - user is blocked`, () => {
            const user = new User();
            user.status = UserStatus.BLOCKED;
            userRepositoryMock.findOne.mockReturnValueOnce(user);

            return request(app.getHttpServer())
                .patch(`/products/${uuid()}`)
                .send({
                    title: '123123',
                    fields: [],
                } as UpdateProductDto)
                .expect(HttpStatus.FORBIDDEN);
        });

        it(`successfully with admin permissions`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user', 'admin'] };
                return true;
            });

            return request(app.getHttpServer())
                .patch(`/products/${uuid()}`)
                .send({
                    title: '123123',
                    fields: [],
                } as UpdateProductDto)
                .expect(HttpStatus.OK);
        });
    });

    describe('block product', () => {
        it(`successfully`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user', 'admin'] };
                return true;
            });
            return request(app.getHttpServer()).patch(`/products/${uuid()}/block`).expect(HttpStatus.OK);
        });

        it(`with error - not authorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).patch(`/products/${uuid()}/block`).expect(HttpStatus.FORBIDDEN);
        });

        it(`with error - not an admin`, () => {
            return request(app.getHttpServer()).patch(`/products/${uuid()}/block`).expect(HttpStatus.FORBIDDEN);
        });

        it(`with error - not valid product id`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user', 'admin'] };
                return true;
            });
            return request(app.getHttpServer())
                .patch(`/products/some/block`)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('Validation failed (uuid  is expected)');
                });
        });
    });

    describe('publish product', () => {
        it(`successfully`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user', 'admin'] };
                return true;
            });
            return request(app.getHttpServer()).patch(`/products/${uuid()}/publish`).expect(HttpStatus.OK);
        });

        it(`with error - not authorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).patch(`/products/${uuid()}/publish`).expect(HttpStatus.FORBIDDEN);
        });

        it(`with error - not an admin`, () => {
            return request(app.getHttpServer()).patch(`/products/${uuid()}/publish`).expect(HttpStatus.FORBIDDEN);
        });

        it(`with error - not valid product id`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user', 'admin'] };
                return true;
            });
            return request(app.getHttpServer())
                .patch(`/products/some/publish`)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('Validation failed (uuid  is expected)');
                });
        });
    });

    describe('complete product', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).patch(`/products/${uuid()}/complete`).expect(HttpStatus.OK);
        });

        it(`with error - not authorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).patch(`/products/${uuid()}/complete`).expect(HttpStatus.FORBIDDEN);
        });

        it(`with error - not valid product id`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user', 'admin'] };
                return true;
            });
            return request(app.getHttpServer())
                .patch(`/products/some/complete`)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('Validation failed (uuid  is expected)');
                });
        });

        it(`with error - not owner of product`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user'] };
                return true;
            });

            return request(app.getHttpServer()).patch(`/products/${uuid()}/complete`).expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('delete product by id', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).delete(`/products/${uuid()}`).expect(HttpStatus.NO_CONTENT);
        });

        it(`with error - not owner of product`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user'] };
                return true;
            });

            return request(app.getHttpServer()).delete(`/products/${uuid()}`).expect(HttpStatus.FORBIDDEN);
        });

        it(`successfully with admin permissions`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user', 'admin'] };
                return true;
            });

            return request(app.getHttpServer()).delete(`/products/${uuid()}`).expect(HttpStatus.NO_CONTENT);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
