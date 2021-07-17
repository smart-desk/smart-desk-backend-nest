import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createRepositoryMock, createTestAppForModule, declareCommonProviders } from '../../../test/test.utils';
import * as request from 'supertest';
import { AccessControlModule } from 'nest-access-control';
import { roles, RolesEnum } from '../app/app.roles';
import { StripeModule } from './stripe.module';
import { AdConfig } from '../ad/enitities/ad-config.entity';
import { v4 as uuid } from 'uuid';
import { User } from '../users/entities/user.entity';
import { AdCampaign, AdCampaignStatus, AdCampaignType } from '../ad/enitities/ad-campaign.entity';
import * as dayjs from 'dayjs';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Stripe controller', () => {
    let app: INestApplication;
    const adConfig = new AdConfig();
    adConfig.id = uuid();
    adConfig.mainHourlyRate = 10;
    adConfig.sidebarHourlyRate = 5;

    const adminUser = new User();
    adminUser.id = uuid();
    adminUser.roles = [RolesEnum.USER, RolesEnum.ADMIN];

    const adCampaign = new AdCampaign();
    adCampaign.id = uuid();
    adCampaign.status = AdCampaignStatus.PENDING;
    adCampaign.img = 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png';
    adCampaign.link = 'https://www.google.com/';
    adCampaign.startDate = new Date().toISOString();
    adCampaign.endDate = dayjs().add(1, 'day').toDate().toISOString();
    adCampaign.reason = 'test';
    adCampaign.type = AdCampaignType.MAIN;

    beforeAll(async () => {
        let moduleBuilder = Test.createTestingModule({
            imports: [StripeModule, AccessControlModule.forRoles(roles)],
        });

        const moduleRef = await declareCommonProviders(moduleBuilder)
            .overrideProvider(getRepositoryToken(AdConfig))
            .useValue(createRepositoryMock([adConfig]))
            .overrideProvider(getRepositoryToken(AdCampaign))
            .useValue(createRepositoryMock([adCampaign]))
            .compile();

        app = await createTestAppForModule(moduleRef);
    });

    // todo add tests for specific cases
    describe('trigger webhook', () => {
        it('successfully', () => {
            return request(app.getHttpServer()).post('/stripe/webhook').expect(HttpStatus.OK);
        });
    });
});
