import { ExecutionContext, forwardRef, HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { v4 as uuid } from 'uuid';
import { createRepositoryMock, createTestAppForModule, declareCommonProviders } from '../../../test/test.utils';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { JwtAuthGuardMock } from '../../../test/mocks/jwt-auth.guard.mock';
import * as request from 'supertest';
import { AccessControlModule } from 'nest-access-control';
import { roles, RolesEnum } from '../app/app.roles';
import { AdModule } from './ad.module';
import { AdConfigDto } from './dto/ad-config.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdConfig } from './enitities/ad-config.entity';
import { AdCampaign, AdCampaignStatus, AdCampaignType } from './enitities/ad-campaign.entity';
import * as dayjs from 'dayjs';
import { User } from '../users/entities/user.entity';
import { AdCampaignDto } from './dto/ad-campaign.dto';

// todo add tests for blocked user
describe('Ad controller', () => {
    let app: INestApplication;
    const adConfig = new AdConfig();
    adConfig.id = uuid();
    adConfig.mainHourlyRate = 10;
    adConfig.sidebarHourlyRate = 5;
    adConfig.liftRate = 60;

    const adminUser = new User();
    adminUser.id = uuid();
    adminUser.roles = [RolesEnum.USER, RolesEnum.ADMIN];

    const adCampaign = new AdCampaign();
    adCampaign.id = uuid();
    adCampaign.status = AdCampaignStatus.PENDING;
    adCampaign.img = 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png';
    adCampaign.link = 'https://www.google.com/';
    adCampaign.startDate = new Date();
    adCampaign.endDate = dayjs().add(1, 'day').toDate();
    adCampaign.reason = 'test';
    adCampaign.type = AdCampaignType.MAIN;

    const JwtGuard = JwtAuthGuardMock;

    beforeAll(async () => {
        let moduleBuilder = Test.createTestingModule({
            imports: [forwardRef(() => AdModule), AccessControlModule.forRoles(roles)],
        });

        const moduleRef = await declareCommonProviders(moduleBuilder)
            .overrideProvider(getRepositoryToken(AdConfig))
            .useValue(createRepositoryMock([adConfig]))
            .overrideProvider(getRepositoryToken(AdCampaign))
            .useValue(createRepositoryMock([adCampaign]))
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
                .post('/ad/config')
                .send({
                    mainHourlyRate: 10,
                    sidebarHourlyRate: 5,
                    liftRate: 60,
                } as AdConfigDto)
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.id).toBeDefined();
                    expect(res.body.mainHourlyRate).toEqual(10);
                    expect(res.body.sidebarHourlyRate).toEqual(5);
                    expect(res.body.liftRate).toEqual(60);
                });
        });

        it('with error unauthorized', () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);

            return request(app.getHttpServer())
                .post('/ad/config')
                .send({
                    mainHourlyRate: 10,
                    sidebarHourlyRate: 5,
                } as AdConfigDto)
                .expect(HttpStatus.FORBIDDEN);
        });

        it('with error not an admin', () => {
            return request(app.getHttpServer())
                .post('/ad/config')
                .send({
                    mainHourlyRate: 10,
                    sidebarHourlyRate: 5,
                } as AdConfigDto)
                .expect(HttpStatus.FORBIDDEN);
        });

        it('with error wrong values', () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = adminUser;
                return true;
            });

            return request(app.getHttpServer())
                .post('/ad/config')
                .send({
                    mainHourlyRate: '5sts',
                    sidebarHourlyRate: '22d',
                    liftRate: '33es',
                } as any)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('mainHourlyRate must be a number conforming to the specified constraints');
                    expect(res.body.message).toContain('sidebarHourlyRate must be a number conforming to the specified constraints');
                    expect(res.body.message).toContain('liftRate must be a number conforming to the specified constraints');
                });
        });
    });

    describe('get config', () => {
        it('successfully', () => {
            return request(app.getHttpServer())
                .get('/ad/config')
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.id).toBeDefined();
                    expect(res.body.mainHourlyRate).toEqual(10);
                    expect(res.body.sidebarHourlyRate).toEqual(5);
                    expect(res.body.liftRate).toEqual(60);
                });
        });
    });

    describe('create campaign', () => {
        it('successfully', () => {
            return request(app.getHttpServer())
                .post('/ad/campaigns')
                .send({
                    ...adCampaign,
                    startDate: dayjs(adCampaign.endDate).add(1, 'days').toDate(),
                    endDate: dayjs(adCampaign.endDate).add(2, 'days').toDate(),
                } as AdCampaignDto)
                .expect(HttpStatus.CREATED);
        });

        it('with error ', () => {
            return request(app.getHttpServer())
                .post('/ad/campaigns')
                .send(adCampaign)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('Dates overlap with another campaign');
                });
        });

        it('with error wrong values', () => {
            return request(app.getHttpServer())
                .post('/ad/campaigns')
                .send({})
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('startDate should not be empty');
                    expect(res.body.message).toContain('endDate should not be empty');
                    expect(res.body.message).toContain('value must be url to image');
                    expect(res.body.message).toContain('img must be an URL address');
                    expect(res.body.message).toContain('img must be shorter than or equal to 1000 characters');
                    expect(res.body.message).toContain('img must be a string');
                    expect(res.body.message).toContain('img should not be empty');
                    expect(res.body.message).toContain('link must be an URL address');
                    expect(res.body.message).toContain('link must be shorter than or equal to 1000 characters');
                    expect(res.body.message).toContain('link must be a string');
                    expect(res.body.message).toContain('link should not be empty');
                    expect(res.body.message).toContain('type must be a valid enum value');
                    expect(res.body.message).toContain('type should not be empty');
                });
        });

        it('with error unauthorized', () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).post('/ad/campaigns').send({}).expect(HttpStatus.FORBIDDEN);
        });
    });

    describe("get campaign's schedule", () => {
        it('successfully', () => {
            return request(app.getHttpServer())
                .get('/ad/campaigns/schedule?type=main')
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.length).toEqual(1);
                });
        });

        it('with error unauthorized', () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).get('/ad/campaigns/schedule?type=main').expect(HttpStatus.FORBIDDEN);
        });

        it('with error wrong campaign type', () => {
            return request(app.getHttpServer()).get('/ad/campaigns/schedule').expect(HttpStatus.BAD_REQUEST);
        });
    });

    describe('get current campaign', () => {
        it('successfully', () => {
            return request(app.getHttpServer())
                .get('/ad/campaigns/current?type=main')
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.link).toBeDefined();
                    expect(res.body.img).toBeDefined();
                    expect(res.body.type).toBeDefined();
                });
        });
    });

    describe('get all campaigns', () => {
        it('successfully', () => {
            return request(app.getHttpServer())
                .get('/ad/campaigns')
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.length).toEqual(1);
                });
        });

        it('with error wrong options', () => {
            return request(app.getHttpServer())
                .get('/ad/campaigns?type=123&status=123&user=123')
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('type must be a valid enum value');
                    expect(res.body.message).toContain('status must be a valid enum value');
                    expect(res.body.message).toContain('user must be an UUID');
                });
        });

        it('with error unauthorized', () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).get('/ad/campaigns').expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('approve campaign', () => {
        it('successfully', () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = adminUser;
                return true;
            });
            return request(app.getHttpServer()).patch(`/ad/campaigns/${uuid()}/approve`).expect(HttpStatus.OK);
        });

        it('with error unauthorized', () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).patch(`/ad/campaigns/${uuid()}/approve`).expect(HttpStatus.FORBIDDEN);
        });

        it('with error not an admin', () => {
            return request(app.getHttpServer()).patch(`/ad/campaigns/${uuid()}/approve`).expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('pay campaign', () => {
        it('successfully', () => {
            return request(app.getHttpServer()).post(`/ad/campaigns/${uuid()}/pay`).expect(HttpStatus.OK);
        });

        it('with error unauthorized', () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).post(`/ad/campaigns/${uuid()}/pay`).expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('reject campaign', () => {
        it('successfully', () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = adminUser;
                return true;
            });
            return request(app.getHttpServer()).patch(`/ad/campaigns/${uuid()}/reject`).send({ reason: 'Test' }).expect(HttpStatus.OK);
        });

        it('with error reason', () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = adminUser;
                return true;
            });
            return request(app.getHttpServer())
                .patch(`/ad/campaigns/${uuid()}/reject`)
                .send({ reason: null })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('reason must be shorter than or equal to 1000 characters');
                    expect(res.body.message).toContain('reason must be a string');
                    expect(res.body.message).toContain('reason should not be empty');
                });
        });

        it('with error unauthorized', () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).patch(`/ad/campaigns/${uuid()}/reject`).expect(HttpStatus.FORBIDDEN);
        });

        it('with error not an admin', () => {
            return request(app.getHttpServer())
                .patch(`/ad/campaigns/${uuid()}/reject`)
                .send({ reason: 'test' })
                .expect(HttpStatus.FORBIDDEN);
        });
    });
});
