import { ExecutionContext, forwardRef, HttpStatus, INestApplication } from '@nestjs/common';
import { PageEntity } from './entities/page.entity';
import { v4 as uuid } from 'uuid';
import { User } from '../users/entities/user.entity';
import { roles, RolesEnum } from '../app/app.roles';
import { Test } from '@nestjs/testing';
import { AccessControlModule } from 'nest-access-control';
import { createRepositoryMock, createTestAppForModule, declareCommonProviders } from '../../../test/test.utils';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PagesModule } from './pages.module';
import * as request from 'supertest';
import { JwtAuthGuardMock } from '../../../test/mocks/jwt-auth.guard.mock';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

describe('page controller', () => {
    let app: INestApplication;
    const page = new PageEntity();
    page.id = uuid();
    page.title = 'title';
    page.content = 'content';

    const adminUser = new User();
    adminUser.id = uuid();
    adminUser.roles = [RolesEnum.USER, RolesEnum.ADMIN];

    const anotherUser = new User();
    anotherUser.id = uuid();
    anotherUser.roles = [RolesEnum.USER];

    const JwtGuard = JwtAuthGuardMock;

    beforeAll(async () => {
        const moduleBuilder = Test.createTestingModule({
            imports: [forwardRef(() => PagesModule), AccessControlModule.forRoles(roles)],
        });

        const moduleRef = await declareCommonProviders(moduleBuilder)
            .overrideProvider(getRepositoryToken(PageEntity))
            .useValue(createRepositoryMock([page]))
            .overrideGuard(JwtAuthGuard)
            .useValue(JwtGuard)
            .compile();

        app = await createTestAppForModule(moduleRef);
    });

    it('update successfully with admin user', () => {
        JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
            const req = context.switchToHttp().getRequest();
            req.user = adminUser;
            return true;
        });

        return request(app.getHttpServer())
            .patch(`/pages/${page.id}`)
            .send({
                id: page.id,
                title: 'title',
                content: 'content',
            })
            .expect(HttpStatus.OK)
            .expect(res => {
                expect(res.body.id).toBeDefined();
                expect(res.body.title).toEqual('title');
                expect(res.body.content).toEqual('content');
            });
    });

    it('update with error unauthorized', () => {
        JwtGuard.canActivate.mockReturnValueOnce(false);

        return request(app.getHttpServer())
            .patch(`/pages/${page.id}`)
            .send({
                id: page.id,
                title: 'title',
                content: 'content',
            })
            .expect(HttpStatus.FORBIDDEN);
    });

    it('update with error not an admin', () => {
        return request(app.getHttpServer())
            .patch(`/pages/${page.id}`)
            .send({
                id: page.id,
                title: 'title',
                content: 'content',
            })
            .expect(HttpStatus.FORBIDDEN);
    });

    it('update with error wrong values', () => {
        JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
            const req = context.switchToHttp().getRequest();
            req.user = adminUser;
            return true;
        });

        return request(app.getHttpServer())
            .patch(`/pages/${page.id}`)
            .send({
                id: page.id,
                title: 1,
                content: 2,
            })
            .expect(HttpStatus.BAD_REQUEST)
            .expect(res => {
                // todo: проверка на максимальную длинну, 255 и 10000 символов
                expect(res.body.message).toContain('title must be a string');
                expect(res.body.message).toContain('content must be a string');
            });
    });

    it('create successfully with admin user', () => {
        JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
            const req = context.switchToHttp().getRequest();
            req.user = adminUser;
            return true;
        });

        return request(app.getHttpServer())
            .post(`/pages`)
            .send({
                title: 'title',
                content: 'content',
            })
            .expect(HttpStatus.CREATED)
            .expect(res => {
                expect(res.body.id).toBeDefined();
                expect(res.body.title).toEqual('title');
                expect(res.body.content).toEqual('content');
            });
    });

    it('create with error wrong values', () => {
        JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
            const req = context.switchToHttp().getRequest();
            req.user = anotherUser;
            return true;
        });

        return request(app.getHttpServer())
            .post(`/pages`)
            .send({
                title: 'title',
                content: 'content',
            })
            .expect(HttpStatus.FORBIDDEN);
    });

    it('create with error not an admin', () => {
        JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
            const req = context.switchToHttp().getRequest();
            req.user = anotherUser;
            return true;
        });

        return request(app.getHttpServer())
            .post(`/pages`)
            .send({
                title: 'title',
                content: 'content',
            })
            .expect(HttpStatus.FORBIDDEN);
    });

    it('get all pages successfully for not authorized user', () => {
        return request(app.getHttpServer())
            .get(`/pages`)
            .expect(HttpStatus.OK)
            .expect(res => {
                expect(res.body.length).toEqual(1);
            });
    });

    it('delete with error not an admin', () => {
        return request(app.getHttpServer()).delete(`/pages/${page.id}`).expect(HttpStatus.FORBIDDEN);
    });

    it('delete successfully for admin', () => {
        JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
            const req = context.switchToHttp().getRequest();
            req.user = adminUser;
            return true;
        });

        return request(app.getHttpServer())
            .delete(`/pages/${page.id}`)
            .expect(HttpStatus.OK)
            .expect(res => {
                expect(res.body.length).toEqual(undefined);
            });
    });

    it('get page by id successfully for not authorized user', () => {
        return request(app.getHttpServer())
            .get(`/pages/${page.id}`)
            .expect(HttpStatus.OK)
            .expect(res => {
                expect(res.body.id).toEqual(page.id);
            });
    });
});
