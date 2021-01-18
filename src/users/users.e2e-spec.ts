import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { v4 as uuid } from 'uuid';
import { createRepositoryMock, createTestAppForModule } from '../../test/test.utils';
import { User } from './entities/user.entity';
import { UsersModule } from './users.module';
import { AccessControlModule } from 'nest-access-control';
import { roles, RolesEnum } from '../app/app.roles';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtAuthGuardMock } from '../../test/mocks/jwt-auth.guard.mock';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';
import { BlockUserDto } from './dto/block-user.dto';

describe('Users controller', () => {
    let app: INestApplication;
    const user = new User();

    const JwtGuard = JwtAuthGuardMock;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [UsersModule, AccessControlModule.forRoles(roles)],
        })
            .overrideProvider(getRepositoryToken(User))
            .useValue(
                createRepositoryMock<User>([user])
            )
            .overrideGuard(JwtAuthGuard)
            .useValue(JwtGuard)
            .compile();

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

    describe('update user', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer())
                .patch('/users/profile')
                .send({
                    firstName: 'New first name',
                    lastName: 'New last name',
                    avatar: 'http://test.com/image.png',
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
                } as UpdateUserDto)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('firstName must be longer than or equal to 1 characters');
                    expect(res.body.message).toContain('lastName must be longer than or equal to 1 characters');
                    expect(res.body.message).toContain('value must be url to image');
                    expect(res.body.message).toContain('avatar must be an URL address');
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
});
