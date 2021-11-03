import { forwardRef, HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { createRepositoryMock, createTestAppForModule, declareCommonProviders } from '../../../test/test.utils';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { JwtAuthGuardMock } from '../../../test/mocks/jwt-auth.guard.mock';
import { PhoneServiceMock } from '../../../test/mocks/phone.service.mock';
import { PhoneModule } from './phone.module';
import { PhoneService } from './phone.service';
import { ACGuard } from 'nest-access-control';
import { AcGuardMock } from '../../../test/mocks/ac.guard.mock';
import { PhoneVerifyCheckDto } from './dto/phone-verify-check.dto';

describe('Phone controller', () => {
    let app: INestApplication;
    const user = new User();
    user.phone = '122312312';
    user.isPhoneVerified = false;

    const JwtGuard = JwtAuthGuardMock;
    const phoneServiceMock = PhoneServiceMock;
    const userServiceRepositoryMock = createRepositoryMock<User>([user]);

    beforeAll(async () => {
        let moduleBuilder = await Test.createTestingModule({
            imports: [forwardRef(() => PhoneModule)],
        });

        const moduleRef = await declareCommonProviders(moduleBuilder)
            .overrideProvider(PhoneService)
            .useValue(phoneServiceMock)
            .overrideProvider(getRepositoryToken(User))
            .useValue(userServiceRepositoryMock)
            .overrideGuard(ACGuard)
            .useValue(AcGuardMock)
            .overrideGuard(JwtAuthGuard)
            .useValue(JwtGuard)
            .compile();

        app = await createTestAppForModule(moduleRef);
    });

    describe('verify phone number', () => {
        describe('request', () => {
            it(`request success`, () => {
                userServiceRepositoryMock.findOne.mockReturnValue(user);
                return request(app.getHttpServer()).post('/phone/verify/request').expect(HttpStatus.OK);
            });

            it(`with error - unauthorized`, () => {
                JwtGuard.canActivate.mockReturnValueOnce(false);
                return request(app.getHttpServer()).post('/phone/verify/request').expect(HttpStatus.FORBIDDEN);
            });

            it(`with error - no phone`, () => {
                userServiceRepositoryMock.findOne.mockReturnValue(new User());
                return request(app.getHttpServer())
                    .post('/phone/verify/request')
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('User cdad7290-07c9-4419-a9d7-2c6c843fef50 has no phone number');
                    });
            });

            it(`with error - phone already verified`, () => {
                const userMock = new User();
                userMock.phone = '123123';
                userMock.isPhoneVerified = true;
                userServiceRepositoryMock.findOne.mockReturnValue(userMock);

                return request(app.getHttpServer())
                    .post('/phone/verify/request')
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('User cdad7290-07c9-4419-a9d7-2c6c843fef50 has already verified phone number');
                    });
            });
        });

        describe('check', () => {
            it(`request success`, () => {
                userServiceRepositoryMock.findOne.mockReturnValue(user);
                return request(app.getHttpServer())
                    .post('/phone/verify/check')
                    .send({
                        code: '1334',
                        requestId: '1313',
                    } as PhoneVerifyCheckDto)
                    .expect(HttpStatus.OK);
            });

            it(`with error - not valid code and requestId`, () => {
                return request(app.getHttpServer())
                    .post('/phone/verify/check')
                    .send({
                        code: '',
                        requestId: null as any,
                    } as PhoneVerifyCheckDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('code must be longer than or equal to 4 characters');
                        expect(res.body.message).toContain('requestId must be a string');
                    });
            });

            it(`with error - unauthorized`, () => {
                JwtGuard.canActivate.mockReturnValueOnce(false);
                return request(app.getHttpServer())
                    .post('/phone/verify/check')
                    .send({
                        code: '1334',
                        requestId: '1313',
                    } as PhoneVerifyCheckDto)
                    .expect(HttpStatus.FORBIDDEN);
            });

            it(`with error - no phone`, () => {
                userServiceRepositoryMock.findOne.mockReturnValue(new User());
                return request(app.getHttpServer())
                    .post('/phone/verify/check')
                    .send({
                        code: '1334',
                        requestId: '1313',
                    } as PhoneVerifyCheckDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('User cdad7290-07c9-4419-a9d7-2c6c843fef50 has no phone number');
                    });
            });

            it(`with error - phone already verified`, () => {
                const userMock = new User();
                userMock.phone = '123123';
                userMock.isPhoneVerified = true;
                userServiceRepositoryMock.findOne.mockReturnValue(userMock);

                return request(app.getHttpServer())
                    .post('/phone/verify/check')
                    .send({
                        code: '1334',
                        requestId: '1313',
                    } as PhoneVerifyCheckDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('User cdad7290-07c9-4419-a9d7-2c6c843fef50 has already verified phone number');
                    });
            });

            it(`with error - code is not correct`, () => {
                const userMock = new User();
                userMock.phone = '123123';
                userServiceRepositoryMock.findOne.mockReturnValue(userMock);
                phoneServiceMock.verifyCheck.mockReturnValueOnce('16');

                return request(app.getHttpServer())
                    .post('/phone/verify/check')
                    .send({
                        code: '1334',
                        requestId: '1313',
                    } as PhoneVerifyCheckDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('Code is not correct');
                    });
            });
        });
    });
});
