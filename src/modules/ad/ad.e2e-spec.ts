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
import { AdCampaign, AdCampaignStatus, AdCampaignType, SHORT_DATE_FORMAT } from './enitities/ad-campaign.entity';
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
    adConfig.adsense = 'adsbygoogle.js?client=ca-pub-1471761211228571';

    const adminUser = new User();
    adminUser.id = uuid();
    adminUser.roles = [RolesEnum.USER, RolesEnum.ADMIN];

    const anotherUser = new User();
    anotherUser.id = uuid();
    anotherUser.roles = [RolesEnum.USER];

    const startDayjs = dayjs().add(1, 'day').startOf('day');
    const endDayjs = dayjs().add(2, 'day').startOf('day');

    const adCampaign = new AdCampaign();
    adCampaign.id = uuid();
    adCampaign.status = AdCampaignStatus.PENDING;
    adCampaign.img = 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png';
    adCampaign.link = 'https://www.google.com/';
    adCampaign.startDate = startDayjs.toISOString();
    adCampaign.endDate = endDayjs.toISOString();
    adCampaign.reason = 'test';
    adCampaign.type = AdCampaignType.MAIN;
    adCampaign.userId = 'cdad7290-07c9-4419-a9d7-2c6c843fef50';
    adCampaign.title = '123';

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
                    adsense: '<script src="adsbygoogle.js?client=ca-pub-1471761211228571"></script>',
                } as AdConfigDto)
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.id).toBeDefined();
                    expect(res.body.mainHourlyRate).toEqual(10);
                    expect(res.body.sidebarHourlyRate).toEqual(5);
                    expect(res.body.liftRate).toEqual(60);
                    expect(res.body.adsense).toEqual(adConfig.adsense);
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
                    adsense: '',
                } as any)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('mainHourlyRate must be a number conforming to the specified constraints');
                    expect(res.body.message).toContain('sidebarHourlyRate must be a number conforming to the specified constraints');
                    expect(res.body.message).toContain('liftRate must be a number conforming to the specified constraints');
                    expect(res.body.message).toContain('adsense must contain a adsbygoogle.js string');
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
                    startDate: startDayjs.add(1, 'days').format(SHORT_DATE_FORMAT),
                    endDate: endDayjs.add(2, 'days').format(SHORT_DATE_FORMAT),
                } as AdCampaignDto)
                .expect(HttpStatus.CREATED);
        });

        it('with error', () => {
            return request(app.getHttpServer())
                .post('/ad/campaigns')
                .send({
                    ...adCampaign,
                    startDate: startDayjs.format(SHORT_DATE_FORMAT),
                    endDate: endDayjs.format(SHORT_DATE_FORMAT),
                })
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

    describe('update campaign', () => {
        it('successfully', () => {
            return request(app.getHttpServer())
                .patch(`/ad/campaigns/${uuid()}`)
                .send({
                    ...adCampaign,
                    startDate: startDayjs.add(1, 'days').format(SHORT_DATE_FORMAT),
                    endDate: endDayjs.add(2, 'days').format(SHORT_DATE_FORMAT),
                } as AdCampaignDto)
                .expect(HttpStatus.OK);
        });

        it('with error overlapping campaigns', () => {
            return request(app.getHttpServer())
                .patch(`/ad/campaigns/${uuid()}`)
                .send({
                    ...adCampaign,
                    startDate: startDayjs.format(SHORT_DATE_FORMAT),
                    endDate: endDayjs.format(SHORT_DATE_FORMAT),
                })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('Dates overlap with another campaign');
                });
        });

        it('with error wrong values', () => {
            return request(app.getHttpServer())
                .patch(`/ad/campaigns/${uuid()}`)
                .send({})
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('startDate should not be empty');
                    expect(res.body.message).toContain('endDate should not be empty');
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
            return request(app.getHttpServer()).patch(`/ad/campaigns/${uuid()}`).send({}).expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('delete campaign', () => {
        it('successfully', () => {
            return request(app.getHttpServer()).delete(`/ad/campaigns/${uuid()}`).expect(HttpStatus.OK);
        });

        it('with error not an owner or admin', () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = anotherUser;
                return true;
            });

            return request(app.getHttpServer()).delete(`/ad/campaigns/${uuid()}`).expect(HttpStatus.FORBIDDEN);
        });

        it('with error unauthorized', () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).patch(`/ad/campaigns/${uuid()}`).send({}).expect(HttpStatus.FORBIDDEN);
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

    describe('get campaign by id', () => {
        it('successfully', () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = adminUser;
                return true;
            });

            return request(app.getHttpServer()).get(`/ad/campaigns/${uuid()}`).expect(HttpStatus.OK);
        });

        it('with error not an owner', () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = anotherUser;
                return true;
            });

            return request(app.getHttpServer()).get(`/ad/campaigns/${uuid()}`).expect(HttpStatus.FORBIDDEN);
        });

        it('with error not authorized', () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);

            return request(app.getHttpServer()).get(`/ad/campaigns/${uuid()}`).expect(HttpStatus.FORBIDDEN);
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
