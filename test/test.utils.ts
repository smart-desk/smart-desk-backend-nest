import { ValidationPipe } from '@nestjs/common';
import { TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import fn = jest.fn;
import { getRepositoryToken } from '@nestjs/typeorm';
import { InputTextEntity } from '../src/modules/dynamic-fields/input-text/input-text.entity';
import { TextareaEntity } from '../src/modules/dynamic-fields/textarea/textarea.entity';
import { RadioEntity } from '../src/modules/dynamic-fields/radio/radio.entity';
import { PhotoEntity } from '../src/modules/dynamic-fields/photo/photo.entity';
import { LocationEntity } from '../src/modules/dynamic-fields/location/location.entity';
import { PriceEntity } from '../src/modules/dynamic-fields/price/price.entity';
import { CheckboxEntity } from '../src/modules/dynamic-fields/checkbox/checkbox.entity';
import { Product } from '../src/modules/products/entities/product.entity';
import { Model } from '../src/modules/models/model.entity';
import { Field } from '../src/modules/fields/field.entity';
import { User } from '../src/modules/users/entities/user.entity';
import { DatepickerEntity } from '../src/modules/dynamic-fields/datepicker/datepicker.entity';
import { MailService } from '../src/modules/mail/mail.service';
import { MailServiceMock } from './mocks/mail.service.mock';
import { StripeServiceMock } from './mocks/stripe.service.mock';
import { StripeService } from '../src/modules/stripe/stripe.service';
import { AdConfig } from '../src/modules/ad/enitities/ad-config.entity';
import { AdCampaign } from '../src/modules/ad/enitities/ad-campaign.entity';
import { PromoSet } from '../src/modules/promo/entities/promo-set.entity';
import { PageEntity } from '../src/modules/pages/entities/page.entity';
import { Promo } from '../src/modules/promo/entities/promo.entity';
import { AppConfig } from '../src/modules/app-config/enitities/app-config.entity';
import { S3Service } from '../src/modules/s3/s3.service';
import { S3ServiceMock } from './mocks/s3.service.mock';

export async function createTestAppForModule(moduleRef: TestingModule) {
    const app = moduleRef.createNestApplication();
    app.useGlobalPipes(
        new ValidationPipe({
            forbidNonWhitelisted: true,
        })
    );
    await app.init();
    return app;
}

export function createRepositoryMock<T>(values?: T[]) {
    const resultValues = values && values.length ? [...values] : [{}];
    return {
        createQueryBuilder: fn().mockReturnValue({
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            offset: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            setParameter: jest.fn().mockReturnThis(),
            andWhereInIds: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getManyAndCount: fn().mockReturnValue([resultValues, resultValues.length]),
            getMany: fn().mockReturnValue(resultValues),
            getOne: fn().mockReturnValue(resultValues[0]),
            getCount: fn().mockReturnValue(resultValues.length),
            execute: fn(),
            leftJoin: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
        }),
        find: fn().mockReturnValue(resultValues),
        findOne: fn().mockReturnValue(resultValues[0]),
        findAndCount: fn().mockReturnValue([resultValues, resultValues.length]),
        create: fn().mockReturnValue(resultValues[0]),
        preload: fn().mockReturnValue(resultValues[0]),
        save: fn().mockReturnValue(resultValues[0]),
        remove: fn().mockReturnValue(resultValues[0]),
        count: fn().mockReturnValue(resultValues.length),
        update: fn(),
        delete: fn(),
    };
}

export function declareCommonProviders(moduleRef: TestingModuleBuilder): TestingModuleBuilder {
    return moduleRef
        .overrideProvider(getRepositoryToken(User))
        .useValue(createRepositoryMock())
        .overrideProvider(getRepositoryToken(Product))
        .useValue(createRepositoryMock())
        .overrideProvider(getRepositoryToken(Field))
        .useValue(createRepositoryMock())
        .overrideProvider(getRepositoryToken(Model))
        .useValue(createRepositoryMock())
        .overrideProvider(getRepositoryToken(InputTextEntity))
        .useValue(createRepositoryMock())
        .overrideProvider(getRepositoryToken(TextareaEntity))
        .useValue(createRepositoryMock())
        .overrideProvider(getRepositoryToken(RadioEntity))
        .useValue(createRepositoryMock())
        .overrideProvider(getRepositoryToken(PhotoEntity))
        .useValue(createRepositoryMock())
        .overrideProvider(getRepositoryToken(LocationEntity))
        .useValue(createRepositoryMock())
        .overrideProvider(getRepositoryToken(PriceEntity))
        .useValue(createRepositoryMock())
        .overrideProvider(getRepositoryToken(CheckboxEntity))
        .useValue(createRepositoryMock())
        .overrideProvider(getRepositoryToken(DatepickerEntity))
        .useValue(createRepositoryMock())
        .overrideProvider(getRepositoryToken(AdConfig))
        .useValue(createRepositoryMock())
        .overrideProvider(getRepositoryToken(AdCampaign))
        .useValue(createRepositoryMock())
        .overrideProvider(getRepositoryToken(PromoSet))
        .useValue(createRepositoryMock())
        .overrideProvider(getRepositoryToken(PageEntity))
        .useValue(createRepositoryMock())
        .overrideProvider(getRepositoryToken(Promo))
        .useValue(createRepositoryMock())
        .overrideProvider(getRepositoryToken(AppConfig))
        .useValue(createRepositoryMock())
        .overrideProvider(MailService)
        .useValue(MailServiceMock)
        .overrideProvider(StripeService)
        .useValue(StripeServiceMock)
        .overrideProvider(S3Service)
        .useValue(S3ServiceMock);
}
