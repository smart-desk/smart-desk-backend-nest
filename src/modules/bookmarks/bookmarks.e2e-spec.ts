import { ExecutionContext, HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { v4 as uuid } from 'uuid';
import { AccessControlModule } from 'nest-access-control';
import { createRepositoryMock, createTestAppForModule, declareCommonProviders } from '../../../test/test.utils';
import { JwtAuthGuardMock } from '../../../test/mocks/jwt-auth.guard.mock';
import { BookmarksModule } from './bookmarks.module';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { roles } from '../app/app.roles';
import { Field } from '../fields/field.entity';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Bookmark } from './entities/bookmark.entity';
import { Product } from '../products/entities/product.entity';
import { FieldType } from '../dynamic-fields/dynamic-fields.module';
import { ProductsModule } from '../products/products.module';
import { Connection } from 'typeorm';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { UserStatus } from '../users/models/user-status.enum';

describe('Bookmarks controller', () => {
    let app: INestApplication;

    const fieldEntity = new Field();
    fieldEntity.type = FieldType.INPUT_TEXT;
    fieldEntity.id = uuid();
    fieldEntity.title = 'test';
    fieldEntity.params = { label: 'Test', placeholder: 'test', required: true };

    const productEntity = new Product();
    productEntity.id = 'cdad7290-07c9-4419-a9d7-2c6c843fef51';
    productEntity.model_id = '12323';
    productEntity.userId = 'cdad7290-07c9-4419-a9d7-2c6c843fef50';

    const bookmark = new Bookmark();
    bookmark.userId = 'cdad7290-07c9-4419-a9d7-2c6c843fef50';
    bookmark.product = productEntity;

    const productRepositoryMock = createRepositoryMock<Product>([productEntity]);
    const fieldRepositoryMock = createRepositoryMock<Field>([fieldEntity]);
    const bookmarkRepositoryMock = createRepositoryMock<Bookmark>([bookmark]);
    const connectionMock = {
        manager: createRepositoryMock(),
    };
    const userRepositoryMock = createRepositoryMock<User>([new User()]);
    const JwtGuard = JwtAuthGuardMock;

    beforeAll(async () => {
        let moduleBuilder = Test.createTestingModule({
            imports: [BookmarksModule, ProductsModule, TypeOrmModule.forRoot(), AccessControlModule.forRoles(roles)],
        });

        const moduleRef = await declareCommonProviders(moduleBuilder)
            .overrideProvider(getRepositoryToken(Product))
            .useValue(productRepositoryMock)
            .overrideProvider(getRepositoryToken(Field))
            .useValue(fieldRepositoryMock)
            .overrideProvider(getRepositoryToken(Bookmark))
            .useValue(bookmarkRepositoryMock)
            .overrideProvider(getRepositoryToken(User))
            .useValue(userRepositoryMock)
            .overrideProvider(Connection)
            .useValue(connectionMock)
            .overrideGuard(JwtAuthGuard)
            .useValue(JwtGuard)
            .compile();

        app = await createTestAppForModule(moduleRef);
    });

    describe('create bookmark', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer())
                .post('/bookmarks')
                .send({
                    productId: uuid(),
                } as CreateBookmarkDto)
                .expect(HttpStatus.CREATED);
        });

        it(`with error - wrong product id`, () => {
            return request(app.getHttpServer())
                .post('/bookmarks')
                .send({
                    productId: '123123123',
                } as CreateBookmarkDto)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('productId must be an UUID');
                });
        });

        it(`with error - unauthorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);

            return request(app.getHttpServer())
                .post('/bookmarks')
                .send({
                    productId: uuid(),
                } as CreateBookmarkDto)
                .expect(HttpStatus.FORBIDDEN);
        });

        it(`with error - user blocked`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user', 'admin'], status: UserStatus.BLOCKED };
                return true;
            });

            return request(app.getHttpServer())
                .post('/bookmarks')
                .send({
                    productId: uuid(),
                } as CreateBookmarkDto)
                .expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('delete bookmarks by id', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).delete(`/bookmarks/${uuid()}`).expect(HttpStatus.NO_CONTENT);
        });

        it(`with error - user blocked`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user', 'admin'], status: UserStatus.BLOCKED };
                return true;
            });

            return request(app.getHttpServer()).delete(`/bookmarks/${uuid()}`).expect(HttpStatus.FORBIDDEN);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
