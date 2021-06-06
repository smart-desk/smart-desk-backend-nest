import { ExecutionContext, HttpStatus, INestApplication } from '@nestjs/common';
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
import { AdCampaign, AdCampaignState, AdCampaignType } from './enitities/ad-campaign.entity';
import * as dayjs from 'dayjs';

// todo add tests for blocked user
describe('Ad controller', () => {
    let app: INestApplication;
    const adConfig = new AdConfig();
    adConfig.id = uuid();
    adConfig.mainHourlyRate = 10;
    adConfig.sidebarHourlyRate = 5;

    const adCampaign = new AdCampaign();
    adCampaign.id = uuid();
    adCampaign.status = AdCampaignState.PENDING;
    adCampaign.img = 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png';
    adCampaign.link = 'https://www.google.com/';
    adCampaign.startDate = new Date();
    adCampaign.endDate = dayjs().add(1, 'day').toDate();
    adCampaign.startTime = new Date();
    adCampaign.endTime = new Date();
    adCampaign.reason = 'test';
    adCampaign.type = AdCampaignType.MAIN;

    const JwtGuard = JwtAuthGuardMock;

    beforeAll(async () => {
        let moduleBuilder = Test.createTestingModule({
            imports: [AdModule, AccessControlModule.forRoles(roles)],
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
                req.user = { id: '007', email: 'test@email.com', roles: [RolesEnum.USER, RolesEnum.ADMIN] };
                return true;
            });

            return request(app.getHttpServer())
                .post('/ad/config')
                .send({
                    mainHourlyRate: 10,
                    sidebarHourlyRate: 5,
                } as AdConfigDto)
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.id).toBeDefined();
                    expect(res.body.mainHourlyRate).toEqual(10);
                    expect(res.body.sidebarHourlyRate).toEqual(5);
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
                req.user = { id: '007', email: 'test@email.com', roles: [RolesEnum.USER, RolesEnum.ADMIN] };
                return true;
            });

            return request(app.getHttpServer())
                .post('/ad/config')
                .send({
                    mainHourlyRate: '5sts',
                    sidebarHourlyRate: '22d',
                } as any)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('mainHourlyRate must be a number conforming to the specified constraints');
                    expect(res.body.message).toContain('sidebarHourlyRate must be a number conforming to the specified constraints');
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
                });
        });
    });

    describe('create campaign', () => {
        it('successfully', () => {
            return request(app.getHttpServer()).post('/ad/campaigns').send(adCampaign).expect(HttpStatus.CREATED);
        });

        it('with error wrong values', () => {
            return request(app.getHttpServer())
                .post('/ad/campaigns')
                .send({})
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('startDate should not be empty');
                    expect(res.body.message).toContain('endDate should not be empty');
                    expect(res.body.message).toContain('startTime should not be empty');
                    expect(res.body.message).toContain('endTime should not be empty');
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
                .get('/ad/campaigns/schedule')
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.length).toEqual(1);
                });
        });

        it('with error unauthorized', () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).get('/ad/campaigns/schedule').expect(HttpStatus.FORBIDDEN);
        });
    });
});
