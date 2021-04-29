import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { v4 as uuid } from 'uuid';
import { Connection } from 'typeorm';
import { AccessControlModule } from 'nest-access-control';
import { createRepositoryMock, createTestAppForModule, declareCommonProviders } from '../../../test/test.utils';
import { Advert } from '../../adverts/entities/advert.entity';
import { AdvertsModule } from '../../adverts/adverts.module';
import { Field } from '../../fields/field.entity';
import { Section, SectionType } from '../../sections/section.entity';
import { CreateAdvertDto } from '../../adverts/dto/create-advert.dto';
import { FieldType } from '../dynamic-fields.module';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { JwtAuthGuardMock } from '../../../test/mocks/jwt-auth.guard.mock';
import { roles } from '../../app/app.roles';
import { UsersModule } from '../../users/users.module';
import { User } from '../../users/entities/user.entity';
import { UpdateAdvertDto } from '../../adverts/dto/update-advert.dto';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';

describe('Photo field', () => {
    let app: INestApplication;

    const fieldEntity = new Field();
    fieldEntity.type = FieldType.PHOTO;
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
        let moduleBuilder = Test.createTestingModule({
            imports: [AdvertsModule, TypeOrmModule.forRoot(), AccessControlModule.forRoles(roles), UsersModule],
        });

        const moduleRef = await declareCommonProviders(moduleBuilder)
            .overrideProvider(getRepositoryToken(Advert))
            .useValue(advertRepositoryMock)
            .overrideProvider(getRepositoryToken(Section))
            .useValue(sectionRepositoryMock)
            .overrideProvider(getRepositoryToken(Field))
            .useValue(fieldRepositoryMock)
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
            const photoField = new Field();
            photoField.type = FieldType.PHOTO;

            it(`successfully`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(photoField);
                return request(app.getHttpServer())
                    .post(`/adverts`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some advert',
                        fields: [
                            {
                                field_id: uuid(),
                                value: ['http://text.com/some-picture.png'],
                            } as CreatePhotoDto,
                        ],
                    } as CreateAdvertDto)
                    .expect(HttpStatus.CREATED);
            });

            it(`with error - not valid field_id`, () => {
                return request(app.getHttpServer())
                    .post(`/adverts`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some advert',
                        fields: [
                            {
                                field_id: '123',
                                value: ['http://text.com/some-picture.png'],
                            } as CreatePhotoDto,
                        ],
                    } as CreateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('field_id must be an UUID');
                    });
            });

            it(`with error - not valid value`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(photoField);
                return request(app.getHttpServer())
                    .post(`/adverts`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some advert',
                        fields: [
                            {
                                field_id: uuid(),
                                value: ['test'],
                            } as CreatePhotoDto,
                        ],
                    } as CreateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('value must be url to image');
                        expect(res.body.message).toContain('each value in value must be an URL address');
                    });
            });

            it(`with error - value is more than 1000 symbols`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(photoField);
                return request(app.getHttpServer())
                    .post(`/adverts`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some advert',
                        fields: [
                            {
                                field_id: uuid(),
                                value: ['http://domain.com/' + Array(1001).fill('a').join('') + '.png'],
                            } as CreatePhotoDto,
                        ],
                    } as CreateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('each value in value must be shorter than or equal to 1000 characters');
                    });
            });
        });

        describe('update advert with photo field', () => {
            const field = new Field();
            field.type = FieldType.PHOTO;

            it(`successfully`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(field);
                return request(app.getHttpServer())
                    .patch(`/adverts/${uuid()}`)
                    .send({
                        title: 'some advert',
                        fields: [
                            {
                                id: uuid(),
                                field_id: uuid(),
                                value: ['http://text.com/some-picture.png'],
                            } as UpdatePhotoDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.OK);
            });

            it(`with error - not valid id`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(field);
                return request(app.getHttpServer())
                    .patch(`/adverts/${uuid()}`)
                    .send({
                        title: 'some advert',
                        fields: [
                            {
                                id: '12312312',
                                field_id: uuid(),
                                value: ['http://text.com/some-picture.png'],
                            } as UpdatePhotoDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('id must be an UUID');
                    });
            });

            it(`with error - not valid field_id`, () => {
                return request(app.getHttpServer())
                    .patch(`/adverts/${uuid()}`)
                    .send({
                        title: 'some advert',
                        fields: [
                            {
                                id: uuid(),
                                field_id: '123',
                                value: ['http://text.com/some-picture.png'],
                            } as UpdatePhotoDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('field_id must be an UUID');
                    });
            });

            it(`with error - not valid value`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(field);
                return request(app.getHttpServer())
                    .patch(`/adverts/${uuid()}`)
                    .send({
                        title: 'some advert',
                        fields: [
                            {
                                field_id: uuid(),
                                value: ['test'],
                            } as UpdatePhotoDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('value must be url to image');
                        expect(res.body.message).toContain('each value in value must be an URL address');
                    });
            });

            it(`with error - value is more than 1000 symbols`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(field);
                return request(app.getHttpServer())
                    .patch(`/adverts/${uuid()}`)
                    .send({
                        title: 'some advert',
                        fields: [
                            {
                                id: uuid(),
                                field_id: uuid(),
                                value: ['http://domain.com/' + Array(1001).fill('a').join('') + '.png'],
                            } as UpdatePhotoDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('each value in value must be shorter than or equal to 1000 characters');
                    });
            });

            it(`successfully with new photo field`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(field);
                return request(app.getHttpServer())
                    .patch(`/adverts/${uuid()}`)
                    .send({
                        title: 'some advert',
                        fields: [
                            {
                                id: null,
                                field_id: uuid(),
                                value: ['http://domain.com/ssdsds.png'],
                            } as UpdatePhotoDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.OK);
            });
        });
    });

    describe('Fields controller', () => {
        // todo add tests
    });

    afterAll(async () => {
        await app.close();
    });
});
