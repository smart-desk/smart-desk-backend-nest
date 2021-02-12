import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { v4 as uuid } from 'uuid';
import { Connection } from 'typeorm';
import { AccessControlModule } from 'nest-access-control';
import { createRepositoryMock, createTestAppForModule } from '../../../test/test.utils';
import { Advert } from '../../adverts/entities/advert.entity';
import { AdvertsModule } from '../../adverts/adverts.module';
import { InputTextEntity } from '../input-text/input-text.entity';
import { TextareaEntity } from '../textarea/textarea.entity';
import { RadioEntity } from '../radio/radio.entity';
import { Field } from '../../fields/field.entity';
import { Section, SectionType } from '../../sections/section.entity';
import { CreateAdvertDto } from '../../adverts/dto/create-advert.dto';
import { FieldType } from '../dynamic-fields.module';
import { PhotoEntity } from '../photo/photo.entity';
import { PriceEntity } from '../price/price.entity';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { JwtAuthGuardMock } from '../../../test/mocks/jwt-auth.guard.mock';
import { roles } from '../../app/app.roles';
import { UsersModule } from '../../users/users.module';
import { User } from '../../users/entities/user.entity';
import { LocationEntity } from './location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateAdvertDto } from '../../adverts/dto/update-advert.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

describe('Location field', () => {
    let app: INestApplication;

    const fieldEntity = new Field();
    fieldEntity.type = FieldType.LOCATION;
    fieldEntity.id = uuid();
    fieldEntity.section_id = uuid();
    fieldEntity.title = 'test';
    fieldEntity.params = {};

    const sectionEntity = new Section();
    sectionEntity.id = uuid();
    sectionEntity.model_id = uuid();
    sectionEntity.type = SectionType.PARAMS;
    sectionEntity.fields = [fieldEntity];

    const advertEntity = new Advert();
    advertEntity.id = '1234';
    advertEntity.sections = [sectionEntity, sectionEntity];
    advertEntity.userId = '123';

    const advertRepositoryMock = createRepositoryMock<Advert>([advertEntity]);
    const sectionRepositoryMock = createRepositoryMock<Section>([sectionEntity]);
    const fieldRepositoryMock = createRepositoryMock<Field>([fieldEntity]);
    const connectionMock = {
        manager: createRepositoryMock(),
    };
    const userRepositoryMock = createRepositoryMock<User>([new User()]);
    const JwtGuard = JwtAuthGuardMock;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AdvertsModule, TypeOrmModule.forRoot(), AccessControlModule.forRoles(roles), UsersModule],
        })
            .overrideProvider(getRepositoryToken(Advert))
            .useValue(advertRepositoryMock)
            .overrideProvider(getRepositoryToken(Section))
            .useValue(sectionRepositoryMock)
            .overrideProvider(getRepositoryToken(Field))
            .useValue(fieldRepositoryMock)
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
            .overrideProvider(getRepositoryToken(User))
            .useValue(userRepositoryMock)
            .overrideProvider(Connection)
            .useValue(connectionMock)
            .overrideGuard(JwtAuthGuard)
            .useValue(JwtGuard)
            .compile();

        app = await createTestAppForModule(moduleRef);
    });

    describe('Adverts controller', () => {
        describe('create advert', () => {
            it(`successfully`, () => {
                return request(app.getHttpServer())
                    .post(`/adverts`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some advert',
                        fields: [
                            {
                                field_id: uuid(),
                                title: 'test',
                                lat: 13,
                                lng: 123,
                            } as CreateLocationDto,
                        ],
                    } as CreateAdvertDto)
                    .expect(HttpStatus.CREATED);
            });

            it(`with error - not valid field`, () => {
                return request(app.getHttpServer())
                    .post(`/adverts`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some advert',
                        fields: [
                            {
                                field_id: uuid(),
                                title: 123123,
                                lat: '123123',
                                lng: '123123',
                            } as any,
                        ],
                    } as CreateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('title must be shorter than or equal to 255 characters');
                        expect(res.body.message).toContain('title must be a string');
                        expect(res.body.message).toContain('lat must be a number conforming to the specified constraints');
                        expect(res.body.message).toContain('lng must be a number conforming to the specified constraints');
                    });
            });
        });

        describe('update advert', () => {
            it(`successfully`, () => {
                return request(app.getHttpServer())
                    .patch(`/adverts/${uuid()}`)
                    .send({
                        title: 'some advert',
                        fields: [
                            {
                                field_id: uuid(),
                                title: 'test',
                                lat: 13,
                                lng: 123,
                            } as UpdateLocationDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.OK);
            });

            it(`with error not valid field`, () => {
                return request(app.getHttpServer())
                    .patch(`/adverts/${uuid()}`)
                    .send({
                        title: 'some advert',
                        fields: [
                            {
                                field_id: uuid(),
                                title: 123123,
                                lat: '123123',
                                lng: '123123',
                            } as any,
                        ],
                    } as CreateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('title must be shorter than or equal to 255 characters');
                        expect(res.body.message).toContain('title must be a string');
                        expect(res.body.message).toContain('lat must be a number conforming to the specified constraints');
                        expect(res.body.message).toContain('lng must be a number conforming to the specified constraints');
                    });
            });
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
