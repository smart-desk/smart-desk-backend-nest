import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { v4 as uuid } from 'uuid';
import { Field } from '../../fields/field.entity';
import { DynamicFieldsModule, FieldType } from '../dynamic-fields.module';
import { Section, SectionType } from '../../sections/section.entity';
import { Advert } from '../../adverts/entities/advert.entity';
import { createRepositoryMock, createTestAppForModule } from '../../../test/test.utils';
import { PhotoEntity } from './photo.entity';
import { AdvertsModule } from '../../adverts/adverts.module';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { CreateAdvertDto, UpdateAdvertDto } from '../../adverts/dto/advert.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { InputTextEntity } from '../input-text/input-text.entity';
import { TextareaEntity } from '../textarea/textarea.entity';
import { RadioEntity } from '../radio/radio.entity';

describe('Adverts controller with photo field', () => {
    let app: INestApplication;

    const fieldEntity = new Field();
    fieldEntity.type = FieldType.INPUT_TEXT;
    fieldEntity.id = uuid();
    fieldEntity.section_id = uuid();
    fieldEntity.title = 'test';
    fieldEntity.params = { label: 'Test', placeholder: 'test', required: true };

    const sectionEntity = new Section();
    sectionEntity.id = uuid();
    sectionEntity.model_id = uuid();
    sectionEntity.type = SectionType.PARAMS;
    sectionEntity.fields = [fieldEntity];

    const advertEntity = new Advert();
    advertEntity.id = '1234';
    advertEntity.sections = [sectionEntity, sectionEntity];

    const advertRepositoryMock = createRepositoryMock<Advert>([advertEntity]);
    const sectionRepositoryMock = createRepositoryMock<Section>([sectionEntity]);
    const fieldRepositoryMock = createRepositoryMock<Field>([fieldEntity]);

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AdvertsModule, TypeOrmModule.forRoot(), DynamicFieldsModule],
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
            .compile();

        app = await createTestAppForModule(moduleRef);
    });

    describe('create advert', () => {
        const field = new Field();
        field.type = FieldType.PHOTO;

        it(`successfully`, () => {
            fieldRepositoryMock.findOne.mockReturnValueOnce(field);
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
            fieldRepositoryMock.findOne.mockReturnValueOnce(field);
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
            fieldRepositoryMock.findOne.mockReturnValueOnce(field);
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
            fieldRepositoryMock.findOne.mockReturnValueOnce(field);
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

    describe('update advert', () => {
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
            fieldRepositoryMock.findOne.mockReturnValueOnce(field);
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

        it(`with error - uuid must not be empty`, () => {
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
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('id should not be empty');
                    expect(res.body.message).toContain('id must be an UUID');
                });
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
