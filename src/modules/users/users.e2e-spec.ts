import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { v4 as uuid } from 'uuid';
import { createRepositoryMock, createTestAppForModule, declareCommonProviders } from '../../../test/test.utils';
import { User } from './entities/user.entity';
import { UsersModule } from './users.module';
import { AccessControlModule } from 'nest-access-control';
import { roles, RolesEnum } from '../app/app.roles';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { JwtAuthGuardMock } from '../../../test/mocks/jwt-auth.guard.mock';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';
import { BlockUserDto } from './dto/block-user.dto';
import { UserStatus } from './user-status.enum';
import { Advert } from '../adverts/entities/advert.entity';
import { PreferContact } from '../adverts/models/prefer-contact.enum';

describe('Users controller', () => {
    let app: INestApplication;
    const user = new User();
    user.id = uuid();
    user.status = UserStatus.ACTIVE;
    user.firstName = 'Peter';
    user.lastName = 'Parker';
    user.phone = '+71231231212';
    user.isPhoneVerified = true;
    user.email = 'email@email.com';

    const advertEntity = new Advert();
    advertEntity.id = uuid();
    advertEntity.sections = [];

    const advertRepositoryMock = createRepositoryMock<Advert>([advertEntity]);
    const userRepositoryMock = createRepositoryMock<User>([user]);
    const JwtGuard = JwtAuthGuardMock;

    beforeAll(async () => {
        let moduleBuilder = await Test.createTestingModule({
            imports: [UsersModule, AccessControlModule.forRoles(roles)],
        });

        moduleBuilder = declareCommonProviders(moduleBuilder);

        moduleBuilder
            .overrideProvider(getRepositoryToken(Advert))
            .useValue(advertRepositoryMock)
            .overrideProvider(getRepositoryToken(User))
            .useValue(userRepositoryMock)
            .overrideGuard(JwtAuthGuard)
            .useValue(JwtGuard);

        const moduleRef = await moduleBuilder.compile();
        app = await createTestAppForModule(moduleRef);
    });

    describe('get all users', () => {
        it(`successfully`, () => {
            JwtGuard.canActivate.mockImplementationOnce(context => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '123', email: 'test@email.com', roles: ['user', 'admin'] };
                return true;
            });

            return request(app.getHttpServer())
                .get('/users')
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body).toBeDefined();
                });
        });

        it(`with error - unauthorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).get('/users').expect(HttpStatus.FORBIDDEN);
        });

        it(`with error - not enough permissions`, () => {
            return request(app.getHttpServer()).get('/users').expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('get user', () => {
        // todo add tests for user and profile owner
        it(`successfully with incomplete info as a user`, () => {
            return request(app.getHttpServer())
                .get(`/users/${uuid()}`)
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.id).toBe(user.id);
                    expect(res.body.status).toBe(user.status);
                    expect(res.body.firstName).toBe(user.firstName);
                    expect(res.body.lastName).toBeUndefined();
                    expect(res.body.email).toBeUndefined();
                    expect(res.body.phone).toBeUndefined();
                    expect(res.body.isPhoneVerified).toBeUndefined();
                });
        });
    });

    describe('update user', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer())
                .patch('/users/profile')
                .send({
                    firstName: 'New first name',
                    lastName: 'New last name',
                    avatar: 'http://test.com/image.png',
                    phone: '+4915141111111',
                } as UpdateUserDto)
                .expect(HttpStatus.OK);
        });

        it(`with error - unauthorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);

            return request(app.getHttpServer())
                .patch('/users/profile')
                .send({
                    firstName: 'New first name',
                    lastName: 'New last name',
                    avatar: 'http://test.com/image.png',
                    phone: '+4915141111111',
                } as UpdateUserDto)
                .expect(HttpStatus.FORBIDDEN);
        });

        it(`with error - properties cannot be empty`, () => {
            return request(app.getHttpServer())
                .patch('/users/profile')
                .send({
                    firstName: '',
                    lastName: '',
                    avatar: '',
                    phone: '',
                } as UpdateUserDto)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('firstName must be longer than or equal to 1 characters');
                    expect(res.body.message).toContain('lastName must be longer than or equal to 1 characters');
                    expect(res.body.message).toContain('value must be url to image');
                    expect(res.body.message).toContain('avatar must be an URL address');
                    expect(res.body.message).toContain('phone must be a valid phone number');
                });
        });

        it(`with error - props must be shorter`, () => {
            return request(app.getHttpServer())
                .patch('/users/profile')
                .send({
                    firstName: Array(256).fill('a').join(''),
                    lastName: Array(256).fill('a').join(''),
                    avatar: 'http://test.com/image' + Array(1001).fill('a').join('') + '.png',
                } as UpdateUserDto)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('firstName must be shorter than or equal to 255 characters');
                    expect(res.body.message).toContain('lastName must be shorter than or equal to 255 characters');
                    expect(res.body.message).toContain('avatar must be shorter than or equal to 1000 characters');
                });
        });
    });

    describe("update user's role", () => {
        it(`successfully`, () => {
            JwtGuard.canActivate.mockImplementationOnce(context => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '123', email: 'test@email.com', roles: ['user', 'admin'] };
                return true;
            });

            return request(app.getHttpServer())
                .patch(`/users/${uuid()}/roles`)
                .send({ roles: [RolesEnum.USER, RolesEnum.ADMIN] } as UpdateUserRolesDto)
                .expect(HttpStatus.OK);
        });

        it(`with error - wrong users roles`, () => {
            JwtGuard.canActivate.mockImplementationOnce(context => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '123', email: 'test@email.com', roles: ['user', 'admin'] };
                return true;
            });

            return request(app.getHttpServer())
                .patch(`/users/${uuid()}/roles`)
                .send({ roles: ['some role' as RolesEnum] } as UpdateUserRolesDto)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('each value in roles must be a valid enum value');
                });
        });

        it(`with error - not an admin`, () => {
            return request(app.getHttpServer())
                .patch(`/users/${uuid()}/roles`)
                .send({ roles: [RolesEnum.USER, RolesEnum.ADMIN] } as UpdateUserRolesDto)
                .expect(HttpStatus.FORBIDDEN);
        });

        it(`with error - unauthorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer())
                .patch(`/users/${uuid()}/roles`)
                .send({ roles: [RolesEnum.USER, RolesEnum.ADMIN] } as UpdateUserRolesDto)
                .expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('block user', () => {
        it(`successfully`, () => {
            JwtGuard.canActivate.mockImplementationOnce(context => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '123', email: 'test@email.com', roles: ['user', 'admin'] };
                return true;
            });

            return request(app.getHttpServer())
                .patch(`/users/${uuid()}/block`)
                .send({ value: true } as BlockUserDto)
                .expect(HttpStatus.OK);
        });

        it(`with error - wrong value`, () => {
            JwtGuard.canActivate.mockImplementationOnce(context => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '123', email: 'test@email.com', roles: ['user', 'admin'] };
                return true;
            });

            return request(app.getHttpServer())
                .patch(`/users/${uuid()}/block`)
                .send({ value: 'some wrong value' })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('value must be a boolean value');
                });
        });

        it(`with error - not an admin`, () => {
            return request(app.getHttpServer())
                .patch(`/users/${uuid()}/block`)
                .send({ value: true } as BlockUserDto)
                .expect(HttpStatus.FORBIDDEN);
        });

        it(`with error - unauthorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer())
                .patch(`/users/${uuid()}/block`)
                .send({ value: true } as BlockUserDto)
                .expect(HttpStatus.FORBIDDEN);
        });
    });

    describe("get user's phone", () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).get(`/users/${uuid()}/phone?advert=${uuid()}`).expect(HttpStatus.OK);
        });

        it(`with error - no advert provided`, () => {
            return request(app.getHttpServer())
                .get(`/users/${uuid()}/phone`)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('advert should not be empty');
                    expect(res.body.message).toContain('advert must be an UUID');
                });
        });

        it(`with error - user prefers chat`, () => {
            advertEntity.preferContact = PreferContact.CHAT;
            advertRepositoryMock.findOne.mockReturnValueOnce(advertEntity);

            return request(app.getHttpServer())
                .get(`/users/${uuid()}/phone?advert=${uuid()}`)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('User prefers chat');
                });
        });

        it(`with error - not found because user has no phone`, () => {
            user.phone = null;
            userRepositoryMock.findOne.mockReturnValueOnce(user);

            return request(app.getHttpServer())
                .get(`/users/${uuid()}/phone?advert=${uuid()}`)
                .expect(HttpStatus.NOT_FOUND)
                .expect(res => {
                    expect(res.body.message).toContain('Phone not found');
                });
        });

        it(`with error - not found because user hasn't verified it`, () => {
            user.phone = '+796521234434';
            user.isPhoneVerified = false;
            userRepositoryMock.findOne.mockReturnValueOnce(user);

            return request(app.getHttpServer())
                .get(`/users/${uuid()}/phone?advert=${uuid()}`)
                .expect(HttpStatus.NOT_FOUND)
                .expect(res => {
                    expect(res.body.message).toContain('Phone not found');
                });
        });

        it(`with error - unauthorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).get(`/users/${uuid()}/phone?advert=${uuid()}`).expect(HttpStatus.FORBIDDEN);
        });
    });
});
