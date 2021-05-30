import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { ExecutionContext, HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { v4 as uuid } from 'uuid';
import { Connection } from 'typeorm';
import { AccessControlModule, ACGuard } from 'nest-access-control';
import { createRepositoryMock, createTestAppForModule, declareCommonProviders } from '../../../test/test.utils';
import { Advert } from './entities/advert.entity';
import { AdvertsModule } from './adverts.module';
import { Field } from '../fields/field.entity';
import { CreateAdvertDto } from './dto/create-advert.dto';
import { UpdateAdvertDto } from './dto/update-advert.dto';
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
import { MailService } from '../mail/mail.service';
import { MailServiceMock } from '../../../test/mocks/mail.service.mock';

describe('Adverts controller', () => {
    let app: INestApplication;

    const fieldEntity = new Field();
    fieldEntity.type = FieldType.INPUT_TEXT;
    fieldEntity.id = uuid();
    fieldEntity.title = 'test';
    fieldEntity.params = { label: 'Test', placeholder: 'test', required: true };

    const advertEntity = new Advert();
    advertEntity.id = '1234';
    advertEntity.userId = '123';

    const advertRepositoryMock = createRepositoryMock<Advert>([advertEntity]);
    const fieldRepositoryMock = createRepositoryMock<Field>([fieldEntity]);
    const connectionMock = {
        manager: createRepositoryMock(),
    };

    beforeAll(async () => {
        let moduleBuilder = await Test.createTestingModule({
            imports: [AdvertsModule, TypeOrmModule.forRoot()],
        });

        const moduleRef = await declareCommonProviders(moduleBuilder)
            .overrideProvider(getRepositoryToken(Advert))
            .useValue(advertRepositoryMock)
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
            .overrideProvider(MailService)
            .useValue(MailServiceMock)
            .compile();

        app = await createTestAppForModule(moduleRef);
    });

    describe('get adverts', () => {
        it(`successfully with no params`, () => {
            return request(app.getHttpServer())
                .get('/adverts')
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.adverts).toBeDefined();
                    expect(res.body.limit).toEqual(20);
                    expect(res.body.totalCount).toEqual(1);
                    expect(res.body.page).toEqual(1);
                });
        });

        it(`successfully with page, limit, search and category`, () => {
            return request(app.getHttpServer())
                .get('/adverts')
                .query({
                    page: 2,
                    limit: 2,
                    category_id: uuid(),
                    search: 'test',
                })
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.adverts).toBeDefined();
                    expect(res.body.limit).toEqual(2);
                    expect(res.body.totalCount).toEqual(1);
                    expect(res.body.page).toEqual(2);
                });
        });

        it(`with error - not valid page`, () => {
            return request(app.getHttpServer())
                .get('/adverts')
                .query({ page: 0 })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('page must be a positive number');
                });
        });

        it(`with error - not valid limit, no negative numbers`, () => {
            return request(app.getHttpServer())
                .get('/adverts')
                .query({ limit: -1 })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('limit must be a positive number');
                });
        });

        it(`with error - not valid limit, no greater than 100`, () => {
            return request(app.getHttpServer())
                .get('/adverts')
                .query({ limit: 300 })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('limit must not be greater than 100');
                });
        });

        it(`with error - not valid search`, () => {
            return request(app.getHttpServer())
                .get('/adverts')
                .query({ search: Array(300).fill('a').join('') })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('search must be shorter than or equal to 255 characters');
                });
        });

        it(`successfully with filters`, () => {
            return request(app.getHttpServer())
                .get(`/adverts?filters[${uuid()}][from]=100&filters[${uuid()}][to]=500`)
                .expect(HttpStatus.OK);
        });

        it(`with error - invalid filters format`, () => {
            return request(app.getHttpServer())
                .get(`/adverts?filters=1000`)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('filters must be an object');
                });
        });

        it(`successfully with sorting`, () => {
            return request(app.getHttpServer()).get(`/adverts?sorting[${uuid()}]=ASC`).expect(HttpStatus.OK);
        });

        it(`with error - invalid sorting format`, () => {
            return request(app.getHttpServer())
                .get(`/adverts?sorting=1000`)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('sorting must be an object');
                });
        });

        it(`successfully with user id`, () => {
            return request(app.getHttpServer()).get(`/adverts?user=${uuid()}`).expect(HttpStatus.OK);
        });

        it(`with error - user uuid is not valid`, () => {
            return request(app.getHttpServer())
                .get(`/adverts?user=1000`)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('user must be an UUID');
                });
        });
    });

    describe('get adverts for category', () => {
        it(`successfully with no params`, () => {
            return request(app.getHttpServer())
                .get(`/adverts/category/${uuid()}`)
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.adverts).toBeDefined();
                    expect(res.body.limit).toEqual(20);
                    expect(res.body.totalCount).toEqual(1);
                    expect(res.body.page).toEqual(1);
                });
        });

        it(`successfully with page, limit, search`, () => {
            return request(app.getHttpServer())
                .get(`/adverts/category/${uuid()}`)
                .query({
                    page: 2,
                    limit: 2,
                    search: 'test',
                })
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.adverts).toBeDefined();
                    expect(res.body.limit).toEqual(2);
                    expect(res.body.totalCount).toEqual(1);
                    expect(res.body.page).toEqual(2);
                });
        });

        it(`with error - not valid category id`, () => {
            return request(app.getHttpServer())
                .get(`/adverts/category/13244`)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('Validation failed (uuid  is expected)');
                });
        });

        it(`with error - not valid page`, () => {
            return request(app.getHttpServer())
                .get(`/adverts/category/${uuid()}`)
                .query({ page: 0 })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('page must be a positive number');
                });
        });

        it(`with error - not valid limit, no negative numbers`, () => {
            return request(app.getHttpServer())
                .get(`/adverts/category/${uuid()}`)
                .query({ limit: -1 })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('limit must be a positive number');
                });
        });

        it(`with error - not valid limit, no greater than 100`, () => {
            return request(app.getHttpServer())
                .get(`/adverts/category/${uuid()}`)
                .query({ limit: 300 })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('limit must not be greater than 100');
                });
        });

        it(`with error - not valid search`, () => {
            return request(app.getHttpServer())
                .get(`/adverts/category/${uuid()}`)
                .query({ search: Array(300).fill('a').join('') })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('search must be shorter than or equal to 255 characters');
                });
        });

        it(`successfully with filters`, () => {
            return request(app.getHttpServer())
                .get(`/adverts/category/${uuid()}?filters[${uuid()}][from]=100&filters[${uuid()}][to]=500`)
                .expect(HttpStatus.OK);
        });

        it(`with error - invalid filters format`, () => {
            return request(app.getHttpServer())
                .get(`/adverts/category/${uuid()}?filters=1000`)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('filters must be an object');
                });
        });

        it(`successfully with sorting`, () => {
            return request(app.getHttpServer()).get(`/adverts/category/${uuid()}?sorting[${uuid()}]=ASC`).expect(HttpStatus.OK);
        });

        it(`with error - invalid sorting format`, () => {
            return request(app.getHttpServer())
                .get(`/adverts/category/${uuid()}?sorting=1000`)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('sorting must be an object');
                });
        });

        it(`successfully with user id`, () => {
            return request(app.getHttpServer()).get(`/adverts/category/${uuid()}?user=${uuid()}`).expect(HttpStatus.OK);
        });

        it(`with error - user uuid is not valid`, () => {
            return request(app.getHttpServer())
                .get(`/adverts/category/${uuid()}?user=1000`)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('user must be an UUID');
                });
        });
    });

    describe('get advert by id', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).get(`/adverts/${uuid()}`).expect(HttpStatus.OK);
        });

        it(`with error - not valid uuid`, () => {
            return request(app.getHttpServer())
                .get('/adverts/123123')
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('Validation failed (uuid  is expected)');
                });
        });

        it(`with error - not found`, () => {
            advertRepositoryMock.findOne.mockReturnValueOnce(undefined);
            return request(app.getHttpServer()).get(`/adverts/${uuid()}`).expect(HttpStatus.NOT_FOUND);
        });
    });

    describe('get recommended adverts by id', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).get(`/adverts/${uuid()}/recommended`).expect(HttpStatus.OK);
        });

        it(`with error - not valid uuid`, () => {
            return request(app.getHttpServer())
                .get('/adverts/123123/recommended')
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('Validation failed (uuid  is expected)');
                });
        });

        it(`with error - not found`, () => {
            advertRepositoryMock.findOne.mockReturnValueOnce(undefined);
            return request(app.getHttpServer()).get(`/adverts/${uuid()}/recommended`).expect(HttpStatus.NOT_FOUND);
        });
    });

    describe('create advert', () => {
        it(`successfully with empty fields array`, () => {
            return request(app.getHttpServer())
                .post(`/adverts`)
                .send({
                    model_id: uuid(),
                    category_id: uuid(),
                    title: 'some advert',
                    preferContact: PreferContact.PHONE,
                    fields: [],
                } as CreateAdvertDto)
                .expect(HttpStatus.CREATED);
        });

        it(`with error - not valid advert params`, () => {
            return request(app.getHttpServer())
                .post(`/adverts`)
                .send({
                    model_id: '12312',
                    category_id: '123123',
                    title: '',
                    preferContact: 'left' as PreferContact,
                    fields: [],
                } as CreateAdvertDto)
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
                .post(`/adverts`)
                .send({
                    model_id: '12312',
                    category_id: '123123',
                    title: '',
                } as CreateAdvertDto)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('fields must be an array');
                    expect(res.body.message).toContain('fields should not be empty');
                });
        });

        it(`with error - title cannot be longer than 255 characters`, () => {
            return request(app.getHttpServer())
                .post(`/adverts`)
                .send({
                    model_id: uuid(),
                    category_id: uuid(),
                    title: Array(300).fill('a').join(''),
                    fields: [],
                } as CreateAdvertDto)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('title must be shorter than or equal to 255 characters');
                });
        });
    });

    describe('update advert', () => {
        it(`successfully with empty fields array`, () => {
            return request(app.getHttpServer())
                .patch(`/adverts/${uuid()}`)
                .send({
                    title: 'some advert',
                    fields: [],
                } as UpdateAdvertDto)
                .expect(HttpStatus.OK);
        });

        it(`with error - not found`, () => {
            advertRepositoryMock.findOne.mockReturnValueOnce(undefined);
            return request(app.getHttpServer())
                .patch(`/adverts/${uuid()}`)
                .send({
                    title: '123123',
                    fields: [],
                } as UpdateAdvertDto)
                .expect(HttpStatus.NOT_FOUND);
        });

        it(`with error - not valid id`, () => {
            return request(app.getHttpServer())
                .patch(`/adverts/123`)
                .send({
                    title: '123123',
                    fields: [],
                } as UpdateAdvertDto)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('Validation failed (uuid  is expected)');
                });
        });

        it(`with error - not valid fields property`, () => {
            return request(app.getHttpServer())
                .patch(`/adverts/${uuid()}`)
                .send({
                    title: '',
                } as UpdateAdvertDto)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('fields must be an array');
                    expect(res.body.message).toContain('fields should not be empty');
                });
        });

        it(`with error - title cannot be longer than 255 characters`, () => {
            return request(app.getHttpServer())
                .patch(`/adverts/${uuid()}`)
                .send({
                    title: Array(300).fill('a').join(''),
                    fields: [],
                } as UpdateAdvertDto)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('title must be shorter than or equal to 255 characters');
                });
        });
    });

    describe('delete advert by id', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).delete(`/adverts/${uuid()}`).expect(HttpStatus.NO_CONTENT);
        });

        it(`with error - not valid uuid`, () => {
            return request(app.getHttpServer())
                .delete('/adverts/123123')
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('Validation failed (uuid  is expected)');
                });
        });

        it(`with error - not found`, () => {
            advertRepositoryMock.findOne.mockReturnValueOnce(undefined);
            return request(app.getHttpServer()).delete(`/adverts/${uuid()}`).expect(HttpStatus.NOT_FOUND);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});

// todo put it together
describe('Adverts controller with ACL enabled', () => {
    let app: INestApplication;

    const fieldEntity = new Field();
    fieldEntity.type = FieldType.INPUT_TEXT;
    fieldEntity.id = uuid();
    fieldEntity.title = 'test';
    fieldEntity.params = { label: 'Test', placeholder: 'test', required: true };

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

    describe('get adverts', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).get('/adverts').expect(HttpStatus.OK);
        });
    });

    describe('get advert by id', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).get(`/adverts/${uuid()}`).expect(HttpStatus.OK);
        });
    });

    describe('get my adverts', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer())
                .get('/adverts/my')
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.adverts).toBeDefined();
                    expect(res.body.limit).toEqual(20);
                    expect(res.body.totalCount).toEqual(1);
                    expect(res.body.page).toEqual(1);
                });
        });

        it(`with error - not authorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).get('/adverts/my').expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('get blocked adverts', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer())
                .get('/adverts/blocked')
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.adverts).toBeDefined();
                    expect(res.body.limit).toEqual(20);
                    expect(res.body.totalCount).toEqual(1);
                    expect(res.body.page).toEqual(1);
                });
        });

        it(`with error - not authorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).get('/adverts/blocked').expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('get pending adverts', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer())
                .get('/adverts/pending')
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.adverts).toBeDefined();
                    expect(res.body.limit).toEqual(20);
                    expect(res.body.totalCount).toEqual(1);
                    expect(res.body.page).toEqual(1);
                });
        });

        it(`with error - not authorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).get('/adverts/pending').expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('get completed adverts', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer())
                .get('/adverts/completed')
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.adverts).toBeDefined();
                    expect(res.body.limit).toEqual(20);
                    expect(res.body.totalCount).toEqual(1);
                    expect(res.body.page).toEqual(1);
                });
        });

        it(`with error - not authorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).get('/adverts/completed').expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('count advert view', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).post(`/adverts/${uuid()}/view`).expect(HttpStatus.OK);
        });
    });

    describe('create advert', () => {
        it(`successfully `, () => {
            return request(app.getHttpServer())
                .post(`/adverts`)
                .send({
                    model_id: uuid(),
                    category_id: uuid(),
                    title: 'some advert',
                    fields: [],
                } as CreateAdvertDto)
                .expect(HttpStatus.CREATED);
        });

        it(`with error - not owner of advert`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);

            return request(app.getHttpServer())
                .post(`/adverts`)
                .send({
                    model_id: '12312',
                    category_id: '123123',
                    title: '',
                    fields: [],
                } as CreateAdvertDto)
                .expect(HttpStatus.FORBIDDEN);
        });

        it(`with error - user is blocked`, () => {
            const user = new User();
            user.status = UserStatus.BLOCKED;
            userRepositoryMock.findOne.mockReturnValueOnce(user);

            return request(app.getHttpServer())
                .post(`/adverts`)
                .send({
                    model_id: '12312',
                    category_id: '123123',
                    title: '',
                    fields: [],
                } as CreateAdvertDto)
                .expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('update advert', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer())
                .patch(`/adverts/${uuid()}`)
                .send({
                    title: 'some advert',
                    fields: [],
                } as UpdateAdvertDto)
                .expect(HttpStatus.OK);
        });

        it(`with error - not owner of advert`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user'] };
                return true;
            });

            return request(app.getHttpServer())
                .patch(`/adverts/${uuid()}`)
                .send({
                    title: '123123',
                    fields: [],
                } as UpdateAdvertDto)
                .expect(HttpStatus.FORBIDDEN);
        });

        it(`with error - user is blocked`, () => {
            const user = new User();
            user.status = UserStatus.BLOCKED;
            userRepositoryMock.findOne.mockReturnValueOnce(user);

            return request(app.getHttpServer())
                .patch(`/adverts/${uuid()}`)
                .send({
                    title: '123123',
                    fields: [],
                } as UpdateAdvertDto)
                .expect(HttpStatus.FORBIDDEN);
        });

        it(`successfully with admin permissions`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user', 'admin'] };
                return true;
            });

            return request(app.getHttpServer())
                .patch(`/adverts/${uuid()}`)
                .send({
                    title: '123123',
                    fields: [],
                } as UpdateAdvertDto)
                .expect(HttpStatus.OK);
        });
    });

    describe('block advert', () => {
        it(`successfully`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user', 'admin'] };
                return true;
            });
            return request(app.getHttpServer()).patch(`/adverts/${uuid()}/block`).expect(HttpStatus.OK);
        });

        it(`with error - not authorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).patch(`/adverts/${uuid()}/block`).expect(HttpStatus.FORBIDDEN);
        });

        it(`with error - not an admin`, () => {
            return request(app.getHttpServer()).patch(`/adverts/${uuid()}/block`).expect(HttpStatus.FORBIDDEN);
        });

        it(`with error - not valid advert id`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user', 'admin'] };
                return true;
            });
            return request(app.getHttpServer())
                .patch(`/adverts/some/block`)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('Validation failed (uuid  is expected)');
                });
        });
    });

    describe('publish advert', () => {
        it(`successfully`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user', 'admin'] };
                return true;
            });
            return request(app.getHttpServer()).patch(`/adverts/${uuid()}/publish`).expect(HttpStatus.OK);
        });

        it(`with error - not authorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).patch(`/adverts/${uuid()}/publish`).expect(HttpStatus.FORBIDDEN);
        });

        it(`with error - not an admin`, () => {
            return request(app.getHttpServer()).patch(`/adverts/${uuid()}/publish`).expect(HttpStatus.FORBIDDEN);
        });

        it(`with error - not valid advert id`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user', 'admin'] };
                return true;
            });
            return request(app.getHttpServer())
                .patch(`/adverts/some/publish`)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('Validation failed (uuid  is expected)');
                });
        });
    });

    describe('complete advert', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).patch(`/adverts/${uuid()}/complete`).expect(HttpStatus.OK);
        });

        it(`with error - not authorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).patch(`/adverts/${uuid()}/complete`).expect(HttpStatus.FORBIDDEN);
        });

        it(`with error - not valid advert id`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user', 'admin'] };
                return true;
            });
            return request(app.getHttpServer())
                .patch(`/adverts/some/complete`)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('Validation failed (uuid  is expected)');
                });
        });

        it(`with error - not owner of advert`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user'] };
                return true;
            });

            return request(app.getHttpServer()).patch(`/adverts/${uuid()}/complete`).expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('delete advert by id', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).delete(`/adverts/${uuid()}`).expect(HttpStatus.NO_CONTENT);
        });

        it(`with error - not owner of advert`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user'] };
                return true;
            });

            return request(app.getHttpServer()).delete(`/adverts/${uuid()}`).expect(HttpStatus.FORBIDDEN);
        });

        it(`successfully with admin permissions`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user', 'admin'] };
                return true;
            });

            return request(app.getHttpServer()).delete(`/adverts/${uuid()}`).expect(HttpStatus.NO_CONTENT);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
