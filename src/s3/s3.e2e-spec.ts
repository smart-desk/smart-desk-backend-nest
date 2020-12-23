import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createTestAppForModule } from '../../test/test.utils';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtAuthGuardMock } from '../../test/mocks/jwt-auth.guard.mock';
import { S3Module } from './s3.module';
import * as request from 'supertest';
import { AccessControlModule } from 'nest-access-control';
import { roles } from '../app/app.roles';
import * as path from 'path';
import { S3Service } from './s3.service';

describe('S3 controller', () => {
    let app: INestApplication;
    const JwtGuard = JwtAuthGuardMock;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [S3Module, AccessControlModule.forRoles(roles)],
        })
            .overrideProvider(S3Service)
            .useValue({ uploadTemporaryImage: () => ({ key: 'Test', location: 'test' }) })
            .overrideGuard(JwtAuthGuard)
            .useValue(JwtGuard)
            .compile();

        app = await createTestAppForModule(moduleRef);
    });

    describe('upload image', () => {
        it('successfully', () => {
            const image = path.resolve(__dirname, '../../test/mocks/images/test.png');

            return request(app.getHttpServer())
                .post('/s3/image')
                .attach('file', image)
                .expect(HttpStatus.CREATED)
                .expect(res => {
                    expect(res.body.key).toBeDefined();
                    expect(res.body.location).toBeDefined();
                });
        });

        it('with error unauthorized', () => {
            const image = path.resolve(__dirname, '../../test/mocks/images/test.png');
            JwtGuard.canActivate.mockReturnValueOnce(false);

            return request(app.getHttpServer()).post('/s3/image').attach('file', image).expect(HttpStatus.FORBIDDEN);
        });
    });
});
