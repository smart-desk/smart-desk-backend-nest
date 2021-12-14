import { ExecutionContext, forwardRef, HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { v4 as uuid } from 'uuid';
import * as request from 'supertest';
import { AccessControlModule } from 'nest-access-control';
import { createRepositoryMock, createTestAppForModule, declareCommonProviders } from '../../../test/test.utils';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { JwtAuthGuardMock } from '../../../test/mocks/jwt-auth.guard.mock';
import { roles, RolesEnum } from '../app/app.roles';
import { User } from '../users/entities/user.entity';
import { AppConfig } from './enitities/app-config.entity';
import { AppConfigDto } from './dto/app-config.dto';
import { AppConfigModule } from './app-config.module';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('App Config controller', () => {
    let app: INestApplication;
    const appConfig = new AppConfig();
    appConfig.id = uuid();
    appConfig.logo = 'test';

    const adminUser = new User();
    adminUser.id = uuid();
    adminUser.roles = [RolesEnum.USER, RolesEnum.ADMIN];

    const anotherUser = new User();
    anotherUser.id = uuid();
    anotherUser.roles = [RolesEnum.USER];

    const JwtGuard = JwtAuthGuardMock;

    beforeAll(async () => {
        let moduleBuilder = Test.createTestingModule({
            imports: [forwardRef(() => AppConfigModule), AccessControlModule.forRoles(roles)],
        });

        const moduleRef = await declareCommonProviders(moduleBuilder)
            .overrideProvider(getRepositoryToken(AppConfig))
            .useValue(createRepositoryMock([appConfig]))
            .overrideGuard(JwtAuthGuard)
            .useValue(JwtGuard)
            .compile();

        app = await createTestAppForModule(moduleRef);
    });

    describe('update config', () => {
        it('successfully', () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = adminUser;
                return true;
            });

            return request(app.getHttpServer())
                .post('/app-config')
                .send({
                    logo: 'test',
                } as AppConfigDto)
                .expect(HttpStatus.FORBIDDEN);
        });

        it('with error unauthorized', () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);

            return request(app.getHttpServer())
                .post('/app-config')
                .send({
                    logo: 'test',
                } as AppConfigDto)
                .expect(HttpStatus.FORBIDDEN);
        });

        it('with error not an admin', () => {
            return request(app.getHttpServer())
                .post('/app-config')
                .send({
                    logo: 'test',
                } as AppConfigDto)
                .expect(HttpStatus.FORBIDDEN);
        });

        it('with error wrong values', () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = adminUser;
                return true;
            });

            return request(app.getHttpServer())
                .post('/app-config')
                .send({
                    logo: 1234,
                } as any)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('logo must be shorter than or equal to 1000 characters');
                    expect(res.body.message).toContain('logo must be a string');
                });
        });
    });

    describe('get config', () => {
        it('successfully', () => {
            return request(app.getHttpServer())
                .get('/app-config')
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.id).toBeDefined();
                    expect(res.body.logo).toEqual('test');
                });
        });
    });
});
