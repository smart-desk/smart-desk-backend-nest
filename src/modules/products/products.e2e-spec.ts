import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { ExecutionContext, HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { v4 as uuid } from 'uuid';
import { Connection } from 'typeorm';
import { AccessControlModule } from 'nest-access-control';
import { createRepositoryMock, createTestAppForModule, declareCommonProviders } from '../../../test/test.utils';
import { Product } from './entities/product.entity';
import { ProductsModule } from './products.module';
import { Field } from '../fields/field.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FieldType } from '../dynamic-fields/dynamic-fields.module';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { JwtAuthGuardMock } from '../../../test/mocks/jwt-auth.guard.mock';
import { roles } from '../app/app.roles';
import { User } from '../users/entities/user.entity';
import { UserStatus } from '../users/models/user-status.enum';
import { PreferContact } from './models/prefer-contact.enum';
import { AdConfig } from '../ad/enitities/ad-config.entity';
import { ProductStatus } from './models/product-status.enum';
import { OptionalJwtAuthGuard } from '../../guards/optional-jwt-auth.guard';
import { AdCampaign } from '../ad/enitities/ad-campaign.entity';

describe('Products controller', () => {
    let app: INestApplication;

    const fieldEntity = new Field();
    fieldEntity.type = FieldType.INPUT_TEXT;
    fieldEntity.id = uuid();
    fieldEntity.title = 'test';
    fieldEntity.params = { label: 'Test', placeholder: 'test', required: true };

    const productEntity = new Product();
    productEntity.id = 'cdad7290-07c9-4419-a9d7-2c6c843fef51';
    productEntity.userId = 'cdad7290-07c9-4419-a9d7-2c6c843fef50';
    productEntity.status = ProductStatus.ACTIVE;

    const adConfig = new AdConfig();
    adConfig.id = '1234';
    adConfig.liftRate = 350;
    adConfig.mainHourlyRate = 500;
    adConfig.sidebarHourlyRate = 45;

    const user = new User();
    user.id = 'cdad7290-07c9-4419-a9d7-2c6c843fef50';
    user.email = 'test@email.com';
    user.roles = ['user'];
    user.status = UserStatus.ACTIVE;

    const productRepositoryMock = createRepositoryMock<Product>([productEntity]);
    const fieldRepositoryMock = createRepositoryMock<Field>([fieldEntity]);
    const connectionMock = {
        manager: createRepositoryMock(),
    };
    const JwtGuard = JwtAuthGuardMock;
    const OptionalJwtGuard = JwtAuthGuardMock;
    const adConfigRepositoryMock = createRepositoryMock<AdConfig>([adConfig]);

    beforeAll(async () => {
        const moduleBuilder = await Test.createTestingModule({
            imports: [ProductsModule, TypeOrmModule.forRoot(), AccessControlModule.forRoles(roles)],
        });

        const moduleRef = await declareCommonProviders(moduleBuilder)
            .overrideProvider(getRepositoryToken(Product))
            .useValue(productRepositoryMock)
            .overrideProvider(getRepositoryToken(Field))
            .useValue(fieldRepositoryMock)
            .overrideProvider(Connection)
            .useValue(connectionMock)
            .overrideProvider(getRepositoryToken(AdConfig))
            .useValue(adConfigRepositoryMock)
            .overrideProvider(getRepositoryToken(AdCampaign))
            .useValue(createRepositoryMock())
            .overrideGuard(JwtAuthGuard)
            .useValue(JwtGuard)
            .overrideGuard(OptionalJwtAuthGuard)
            .useValue(OptionalJwtGuard)
            .compile();

        app = await createTestAppForModule(moduleRef);
    });

    describe('get products', () => {
        it(`successfully with status completed`, () => {
            return request(app.getHttpServer()).get('/products').query({ status: ProductStatus.COMPLETED }).expect(HttpStatus.OK);
        });

        it(`forbidden with options not completed or active`, () => {
            return request(app.getHttpServer()).get('/products').query({ status: ProductStatus.PENDING }).expect(HttpStatus.FORBIDDEN);
        });

        it(`successfully with res.body and status active`, () => {
            return request(app.getHttpServer())
                .get('/products')
                .query({ status: ProductStatus.ACTIVE })
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
                    status: ProductStatus.ACTIVE,
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

        it(`successfully if user requests his own pending products`, () => {
            return request(app.getHttpServer())
                .get('/products')
                .query({ user: 'cdad7290-07c9-4419-a9d7-2c6c843fef50', status: ProductStatus.PENDING })
                .expect(HttpStatus.OK);
        });

        it(`successfully if user requests his own blocked products`, () => {
            return request(app.getHttpServer())
                .get('/products')
                .query({ user: 'cdad7290-07c9-4419-a9d7-2c6c843fef50', status: ProductStatus.BLOCKED })
                .expect(HttpStatus.OK);
        });

        it(`successfully with user admin as well`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user', 'admin'] };
                return true;
            });

            return request(app.getHttpServer()).get('/products').expect(HttpStatus.OK);
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
            const JwtGuard = JwtAuthGuardMock;
            const userId = uuid();
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: userId, email: 'test@email.com', roles: ['user'] };
                return true;
            });
            return request(app.getHttpServer()).get(`/products/category/${uuid()}?user=${userId}`).expect(HttpStatus.OK);
        });

        it(`with error - user uuid is not valid`, () => {
            return request(app.getHttpServer())
                .get(`/products/category/${uuid()}?user=1000`)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('user must be an UUID');
                });
        });

        it(`successfully if user requests his own pending products`, () => {
            return request(app.getHttpServer())
                .get('/products/category/' + uuid())
                .query({ user: 'cdad7290-07c9-4419-a9d7-2c6c843fef50', status: ProductStatus.PENDING })
                .expect(HttpStatus.OK);
        });

        it(`successfully if user requests his own blocked products`, () => {
            return request(app.getHttpServer())
                .get('/products/category/' + uuid())
                .query({ user: 'cdad7290-07c9-4419-a9d7-2c6c843fef50', status: ProductStatus.BLOCKED })
                .expect(HttpStatus.OK);
        });

        it(`successfully with user admin as well`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user', 'admin'] };
                return true;
            });

            return request(app.getHttpServer())
                .get('/products/category/' + uuid())
                .expect(HttpStatus.OK);
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

        it(`with error 404 - status pending`, () => {
            productEntity.status = ProductStatus.PENDING;
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user'] };
                return true;
            });
            productRepositoryMock.findOne.mockReturnValueOnce(productEntity);
            return request(app.getHttpServer()).get(`/products/${uuid()}`).expect(HttpStatus.NOT_FOUND);
        });

        it(`with error 404 - status blocked wrong user`, () => {
            productEntity.status = ProductStatus.BLOCKED;
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user'] };
                return true;
            });
            productRepositoryMock.findOne.mockReturnValueOnce(productEntity);
            return request(app.getHttpServer()).get(`/products/${uuid()}`).expect(HttpStatus.NOT_FOUND);
        });

        it(`with error 403 - status blocked, unauthorised`, () => {
            productEntity.status = ProductStatus.BLOCKED;
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = undefined;
                return true;
            });
            productRepositoryMock.findOne.mockReturnValueOnce(productEntity);
            return request(app.getHttpServer()).get(`/products/${uuid()}`).expect(HttpStatus.NOT_FOUND);
        });
    });

    describe('get recommended products by id', () => {
        it(`successfully`, () => {
            productEntity.status = ProductStatus.ACTIVE;
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

        it(`with error - not authorized`, () => {
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
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: uuid(), email: 'test@email.com', roles: ['user'], status: UserStatus.BLOCKED };
                return true;
            });

            return request(app.getHttpServer())
                .post(`/products`)
                .send({
                    model_id: uuid(),
                    category_id: uuid(),
                    title: '123',
                    fields: [],
                } as CreateProductDto)
                .expect(HttpStatus.FORBIDDEN);
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
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user'], status: UserStatus.BLOCKED };
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

        it(`successfully with admin permissions`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user', 'admin'], status: UserStatus.ACTIVE };
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

    describe('lift product', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).post(`/products/${productEntity.id}/lift`).expect(HttpStatus.OK);
        });

        it(`with error - product must be published`, () => {
            productEntity.status = ProductStatus.BLOCKED;
            productRepositoryMock.findOne.mockReturnValueOnce({ ...productEntity });

            return request(app.getHttpServer())
                .post(`/products/${uuid()}/lift`)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('Product must be published');
                });
        });

        it(`with error - no configuration`, () => {
            adConfig.liftRate = undefined;
            adConfigRepositoryMock.findOne.mockReturnValueOnce({ ...adConfig });

            return request(app.getHttpServer())
                .post(`/products/${uuid()}/lift`)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('No configuration for this action');
                });
        });

        it(`with error - not authorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).post(`/products/${uuid()}/lift`).expect(HttpStatus.FORBIDDEN);
        });

        it(`with error - not valid product id`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user', 'admin'] };
                return true;
            });
            return request(app.getHttpServer())
                .post(`/products/some/lift`)
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

            return request(app.getHttpServer()).post(`/products/${uuid()}/lift`).expect(HttpStatus.FORBIDDEN);
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

    describe('block product', () => {
        it(`successfully`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user', 'admin'] };
                return true;
            });
            return request(app.getHttpServer()).patch(`/products/${uuid()}/block`).send({ reason: 'This is wrong' }).expect(HttpStatus.OK);
        });

        it(`with error - not authorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer())
                .patch(`/products/${uuid()}/block`)
                .send({ reason: 'This is wrong' })
                .expect(HttpStatus.FORBIDDEN);
        });

        it(`with error - not an admin`, () => {
            return request(app.getHttpServer())
                .patch(`/products/${uuid()}/block`)
                .send({ reason: 'This is wrong' })
                .expect(HttpStatus.FORBIDDEN);
        });

        it(`with error - not valid product id`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user', 'admin'] };
                return true;
            });
            return request(app.getHttpServer())
                .patch(`/products/some/block`)
                .send({ reason: 'This is wrong' })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('Validation failed (uuid  is expected)');
                });
        });

        it(`with error - invalid reason`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user', 'admin'] };
                return true;
            });
            return request(app.getHttpServer())
                .patch(`/products/${uuid()}/block`)
                .send({ reason: null })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('reason should not be empty');
                    expect(res.body.message).toContain('reason must be shorter than or equal to 1000 characters');
                    expect(res.body.message).toContain('reason must be a string');
                });
        });
    });

    describe('count product view', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).post(`/products/${uuid()}/view`).expect(HttpStatus.OK);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
