import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { ExecutionContext, HttpStatus, INestApplication, Inject } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { v4 as uuid } from 'uuid';
import { Connection } from 'typeorm';
import { AccessControlModule, ACGuard } from 'nest-access-control';
import { createRepositoryMock, createTestAppForModule } from '../../test/test.utils';
import { Advert } from './entities/advert.entity';
import { AdvertsModule } from './adverts.module';
import { InputTextEntity } from '../dynamic-fields/input-text/input-text.entity';
import { TextareaEntity } from '../dynamic-fields/textarea/textarea.entity';
import { RadioEntity } from '../dynamic-fields/radio/radio.entity';
import { Field } from '../fields/field.entity';
import { Section, SectionType } from '../sections/section.entity';
import { CreateAdvertDto, UpdateAdvertDto } from './dto/advert.dto';
import { UpdateInputTextDto } from '../dynamic-fields/input-text/dto/update-input-text.dto';
import { UpdateTextareaDto } from '../dynamic-fields/textarea/dto/update-textarea.dto';
import { UpdateRadioDto } from '../dynamic-fields/radio/dto/update-radio.dto';
import { CreateInputTextDto } from '../dynamic-fields/input-text/dto/create-input-text.dto';
import { CreateTextareaDto } from '../dynamic-fields/textarea/dto/create-textarea.dto';
import { CreateRadioDto } from '../dynamic-fields/radio/dto/create-radio.dto';
import { FieldType } from '../dynamic-fields/dynamic-fields.module';
import { PhotoEntity } from '../dynamic-fields/photo/photo.entity';
import { CreatePhotoDto } from '../dynamic-fields/photo/dto/create-photo.dto';
import { UpdatePhotoDto } from '../dynamic-fields/photo/dto/update-photo.dto';
import { PriceEntity } from '../dynamic-fields/price/price.entity';
import { CreatePriceDto } from '../dynamic-fields/price/dto/create-price.dto';
import { UpdatePriceDto } from '../dynamic-fields/price/dto/update-price.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtAuthGuardMock } from '../../test/mocks/jwt-auth.guard.mock';
import { AcGuardMock } from '../../test/mocks/ac.guard.mock';
import { roles } from '../app/app.roles';

describe('Adverts controller', () => {
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
    advertEntity.userId = '123';

    const advertRepositoryMock = createRepositoryMock<Advert>([advertEntity]);
    const sectionRepositoryMock = createRepositoryMock<Section>([sectionEntity]);
    const fieldRepositoryMock = createRepositoryMock<Field>([fieldEntity]);
    const connectionMock = {
        manager: createRepositoryMock(),
    };

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AdvertsModule, TypeOrmModule.forRoot()],
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
            .overrideProvider(getRepositoryToken(PriceEntity))
            .useValue(createRepositoryMock())
            .overrideProvider(Connection)
            .useValue(connectionMock)
            .overrideGuard(JwtAuthGuard)
            .useValue(JwtAuthGuardMock)
            .overrideGuard(ACGuard)
            .useValue(AcGuardMock)
            .compile();

        app = await createTestAppForModule(moduleRef);
    });

    describe('get adverts', () => {
        it(`successfully with no params`, () => {
            return request(app.getHttpServer())
                .get('/adverts')
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.adverts).toBeDefined();
                    expect(res.body.limit).toEqual(20);
                    expect(res.body.totalCount).toEqual(1);
                    expect(res.body.page).toEqual(1);
                });
        });

        it(`successfully with page, limit, search and category`, () => {
            return request(app.getHttpServer())
                .get('/adverts')
                .query({
                    page: 2,
                    limit: 2,
                    category_id: uuid(),
                    search: 'test',
                })
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.adverts).toBeDefined();
                    expect(res.body.limit).toEqual(2);
                    expect(res.body.totalCount).toEqual(1);
                    expect(res.body.page).toEqual(2);
                });
        });

        it(`with error - not valid page`, () => {
            return request(app.getHttpServer())
                .get('/adverts')
                .query({ page: 0 })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('page must be a positive number');
                });
        });

        it(`with error - not valid limit, no negative numbers`, () => {
            return request(app.getHttpServer())
                .get('/adverts')
                .query({ limit: -1 })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('limit must be a positive number');
                });
        });

        it(`with error - not valid limit, no greater than 100`, () => {
            return request(app.getHttpServer())
                .get('/adverts')
                .query({ limit: 300 })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('limit must not be greater than 100');
                });
        });

        it(`with error - not valid search`, () => {
            return request(app.getHttpServer())
                .get('/adverts')
                .query({ search: Array(300).fill('a').join('') })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('search must be shorter than or equal to 255 characters');
                });
        });

        it(`successfully with filters`, () => {
            return request(app.getHttpServer())
                .get(`/adverts?filters[${uuid()}][from]=100&filters[${uuid()}][to]=500`)
                .expect(HttpStatus.OK);
        });

        it(`with error - invalid filters format`, () => {
            return request(app.getHttpServer())
                .get(`/adverts?filters=1000`)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('filters must be an object');
                });
        });
    });

    describe('get adverts for category', () => {
        it(`successfully with no params`, () => {
            return request(app.getHttpServer())
                .get(`/adverts/category/${uuid()}`)
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.adverts).toBeDefined();
                    expect(res.body.limit).toEqual(20);
                    expect(res.body.totalCount).toEqual(1);
                    expect(res.body.page).toEqual(1);
                });
        });

        it(`successfully with page, limit, search`, () => {
            return request(app.getHttpServer())
                .get(`/adverts/category/${uuid()}`)
                .query({
                    page: 2,
                    limit: 2,
                    search: 'test',
                })
                .expect(HttpStatus.OK)
                .expect(res => {
                    expect(res.body.adverts).toBeDefined();
                    expect(res.body.limit).toEqual(2);
                    expect(res.body.totalCount).toEqual(1);
                    expect(res.body.page).toEqual(2);
                });
        });

        it(`with error - not valid category id`, () => {
            return request(app.getHttpServer())
                .get(`/adverts/category/13244`)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('Validation failed (uuid  is expected)');
                });
        });

        it(`with error - not valid page`, () => {
            return request(app.getHttpServer())
                .get(`/adverts/category/${uuid()}`)
                .query({ page: 0 })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('page must be a positive number');
                });
        });

        it(`with error - not valid limit, no negative numbers`, () => {
            return request(app.getHttpServer())
                .get(`/adverts/category/${uuid()}`)
                .query({ limit: -1 })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('limit must be a positive number');
                });
        });

        it(`with error - not valid limit, no greater than 100`, () => {
            return request(app.getHttpServer())
                .get(`/adverts/category/${uuid()}`)
                .query({ limit: 300 })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('limit must not be greater than 100');
                });
        });

        it(`with error - not valid search`, () => {
            return request(app.getHttpServer())
                .get(`/adverts/category/${uuid()}`)
                .query({ search: Array(300).fill('a').join('') })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('search must be shorter than or equal to 255 characters');
                });
        });

        it(`successfully with filters`, () => {
            return request(app.getHttpServer())
                .get(`/adverts/category/${uuid()}?filters[${uuid()}][from]=100&filters[${uuid()}][to]=500`)
                .expect(HttpStatus.OK);
        });

        it(`with error - invalid filters format`, () => {
            return request(app.getHttpServer())
                .get(`/adverts/category/${uuid()}?filters=1000`)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('filters must be an object');
                });
        });
    });

    describe('get advert by id', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).get(`/adverts/${uuid()}`).expect(HttpStatus.OK);
        });

        it(`with error - not valid uuid`, () => {
            return request(app.getHttpServer())
                .get('/adverts/123123')
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('Validation failed (uuid  is expected)');
                });
        });

        it(`with error - not found`, () => {
            advertRepositoryMock.findOne.mockReturnValueOnce(undefined);
            return request(app.getHttpServer()).get(`/adverts/${uuid()}`).expect(HttpStatus.NOT_FOUND);
        });
    });

    describe('create advert', () => {
        it(`successfully with empty fields array`, () => {
            return request(app.getHttpServer())
                .post(`/adverts`)
                .send({
                    model_id: uuid(),
                    category_id: uuid(),
                    title: 'some advert',
                    fields: [],
                } as CreateAdvertDto)
                .expect(HttpStatus.CREATED);
        });

        it(`with error - not valid model_id, category_id and empty title`, () => {
            return request(app.getHttpServer())
                .post(`/adverts`)
                .send({
                    model_id: '12312',
                    category_id: '123123',
                    title: '',
                    fields: [],
                } as CreateAdvertDto)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('category_id must be an UUID');
                    expect(res.body.message).toContain('model_id must be an UUID');
                    expect(res.body.message).toContain('title should not be empty');
                });
        });

        it(`with error - not valid fields property`, () => {
            return request(app.getHttpServer())
                .post(`/adverts`)
                .send({
                    model_id: '12312',
                    category_id: '123123',
                    title: '',
                } as CreateAdvertDto)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('fields must be an array');
                    expect(res.body.message).toContain('fields should not be empty');
                });
        });

        it(`with error - title cannot be longer than 255 characters`, () => {
            return request(app.getHttpServer())
                .post(`/adverts`)
                .send({
                    model_id: uuid(),
                    category_id: uuid(),
                    title: Array(300).fill('a').join(''),
                    fields: [],
                } as CreateAdvertDto)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('title must be shorter than or equal to 255 characters');
                });
        });

        describe('create advert with input_text field', () => {
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
                                value: 'test',
                            } as CreateInputTextDto,
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
                                value: '',
                            } as CreateInputTextDto,
                        ],
                    } as CreateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('field_id must be an UUID');
                    });
            });

            it(`with error - not valid value`, () => {
                return request(app.getHttpServer())
                    .post(`/adverts`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some advert',
                        fields: [
                            {
                                field_id: uuid(),
                                value: '',
                            } as CreateInputTextDto,
                        ],
                    } as CreateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('value should not be empty');
                    });
            });
        });

        describe('create advert with textarea field', () => {
            const textareaField = new Field();
            textareaField.type = FieldType.TEXTAREA;

            it(`successfully`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(textareaField);
                return request(app.getHttpServer())
                    .post(`/adverts`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some advert',
                        fields: [
                            {
                                field_id: uuid(),
                                value: 'test',
                            } as CreateTextareaDto,
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
                                value: 'test',
                            } as CreateTextareaDto,
                        ],
                    } as CreateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('field_id must be an UUID');
                    });
            });

            it(`with error - not valid value`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(textareaField);
                return request(app.getHttpServer())
                    .post(`/adverts`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some advert',
                        fields: [
                            {
                                field_id: uuid(),
                                value: Array(1001).fill('a').join(''),
                            } as CreateTextareaDto,
                        ],
                    } as CreateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('value must be shorter than or equal to 1000 characters');
                    });
            });
        });

        describe('create advert with radio field', () => {
            const radioField = new Field();
            radioField.type = FieldType.RADIO;

            it(`successfully`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(radioField);
                return request(app.getHttpServer())
                    .post(`/adverts`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some advert',
                        fields: [
                            {
                                field_id: uuid(),
                                value: 'test',
                            } as CreateRadioDto,
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
                                value: 'test',
                            } as CreateRadioDto,
                        ],
                    } as CreateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('field_id must be an UUID');
                    });
            });

            it(`with error - not valid value`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(radioField);
                return request(app.getHttpServer())
                    .post(`/adverts`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some advert',
                        fields: [
                            {
                                field_id: uuid(),
                                value: Array(256).fill('a').join(''),
                            } as CreateRadioDto,
                        ],
                    } as CreateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('value must be shorter than or equal to 255 characters');
                    });
            });
        });

        describe('create advert with photo field', () => {
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

        describe('create advert with price field', () => {
            const photoField = new Field();
            photoField.type = FieldType.PRICE;

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
                                value: 1000,
                            } as CreatePriceDto,
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
                                value: 1000,
                            } as CreatePriceDto,
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
                                value: -100,
                            } as CreatePriceDto,
                        ],
                    } as CreateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('value must be a positive number');
                    });
            });
        });
    });

    describe('update advert', () => {
        it(`successfully with empty fields array`, () => {
            return request(app.getHttpServer())
                .patch(`/adverts/${uuid()}`)
                .send({
                    title: 'some advert',
                    fields: [],
                } as UpdateAdvertDto)
                .expect(HttpStatus.OK);
        });

        it(`with error - not found`, () => {
            advertRepositoryMock.findOne.mockReturnValueOnce(undefined);
            return request(app.getHttpServer())
                .patch(`/adverts/${uuid()}`)
                .send({
                    title: '123123',
                    fields: [],
                } as UpdateAdvertDto)
                .expect(HttpStatus.NOT_FOUND);
        });

        it(`with error - not valid id`, () => {
            return request(app.getHttpServer())
                .patch(`/adverts/123`)
                .send({
                    title: '123123',
                    fields: [],
                } as UpdateAdvertDto)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('Validation failed (uuid  is expected)');
                });
        });

        it(`with error - not valid fields property`, () => {
            return request(app.getHttpServer())
                .patch(`/adverts/${uuid()}`)
                .send({
                    title: '',
                } as UpdateAdvertDto)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('fields must be an array');
                    expect(res.body.message).toContain('fields should not be empty');
                });
        });

        it(`with error - title cannot be longer than 255 characters`, () => {
            return request(app.getHttpServer())
                .patch(`/adverts/${uuid()}`)
                .send({
                    title: Array(300).fill('a').join(''),
                    fields: [],
                } as UpdateAdvertDto)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('title must be shorter than or equal to 255 characters');
                });
        });

        describe('update advert with input_text field', () => {
            it(`successfully`, () => {
                return request(app.getHttpServer())
                    .patch(`/adverts/${uuid()}`)
                    .send({
                        title: 'some advert',
                        fields: [
                            {
                                id: uuid(),
                                field_id: uuid(),
                                value: 'new text',
                            } as UpdateInputTextDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.OK);
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
                                value: 'new text',
                            } as UpdateInputTextDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('field_id must be an UUID');
                    });
            });

            it(`with error - not valid value`, () => {
                return request(app.getHttpServer())
                    .patch(`/adverts/${uuid()}`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some advert',
                        fields: [
                            {
                                id: uuid(),
                                field_id: uuid(),
                                value: '',
                            } as UpdateInputTextDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('value should not be empty');
                    });
            });

            it(`with error - value is too long`, () => {
                return request(app.getHttpServer())
                    .patch(`/adverts/${uuid()}`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some advert',
                        fields: [
                            {
                                id: uuid(),
                                field_id: uuid(),
                                value: Array(300).fill('a').join(''),
                            } as UpdateInputTextDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('value must be shorter than or equal to 255 characters');
                    });
            });

            it(`with error - id is not valid`, () => {
                return request(app.getHttpServer())
                    .patch(`/adverts/${uuid()}`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some advert',
                        fields: [
                            {
                                id: '123',
                                field_id: uuid(),
                                value: '1234',
                            } as UpdateInputTextDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('id must be an UUID');
                    });
            });

            it(`with error - field not found`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(undefined);

                return request(app.getHttpServer())
                    .patch(`/adverts/${uuid()}`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some advert',
                        fields: [
                            {
                                id: uuid(),
                                field_id: uuid(),
                                value: '1234',
                            } as UpdateInputTextDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.NOT_FOUND)
                    .expect(res => {
                        expect(res.body.message).toContain('Field not found');
                    });
            });
        });

        describe('update advert with textarea field', () => {
            const textareaField = new Field();
            textareaField.type = FieldType.TEXTAREA;

            it(`successfully`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(textareaField);
                return request(app.getHttpServer())
                    .patch(`/adverts/${uuid()}`)
                    .send({
                        title: 'some advert',
                        fields: [
                            {
                                id: uuid(),
                                field_id: uuid(),
                                value: 'new text',
                            } as UpdateTextareaDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.OK);
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
                                value: 'new text',
                            } as UpdateTextareaDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('field_id must be an UUID');
                    });
            });

            it(`with error - not valid value`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(textareaField);
                return request(app.getHttpServer())
                    .patch(`/adverts/${uuid()}`)
                    .send({
                        title: 'some advert',
                        fields: [
                            {
                                id: uuid(),
                                field_id: uuid(),
                                value: '',
                            } as UpdateTextareaDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('value should not be empty');
                    });
            });

            it(`with error - value is too long`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(textareaField);
                return request(app.getHttpServer())
                    .patch(`/adverts/${uuid()}`)
                    .send({
                        title: 'some advert',
                        fields: [
                            {
                                id: uuid(),
                                field_id: uuid(),
                                value: Array(1001).fill('a').join(''),
                            } as UpdateTextareaDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('value must be shorter than or equal to 1000 characters');
                    });
            });

            it(`with error - id is not valid`, () => {
                return request(app.getHttpServer())
                    .patch(`/adverts/${uuid()}`)
                    .send({
                        title: 'some advert',
                        fields: [
                            {
                                id: '123',
                                field_id: uuid(),
                                value: '1234',
                            } as UpdateTextareaDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('id must be an UUID');
                    });
            });

            it(`with error - field not found`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(undefined);
                return request(app.getHttpServer())
                    .patch(`/adverts/${uuid()}`)
                    .send({
                        title: 'some advert',
                        fields: [
                            {
                                id: uuid(),
                                field_id: uuid(),
                                value: '1234',
                            } as UpdateTextareaDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.NOT_FOUND)
                    .expect(res => {
                        expect(res.body.message).toContain('Field not found');
                    });
            });
        });

        describe('update advert with radio field', () => {
            const radioField = new Field();
            radioField.type = FieldType.RADIO;

            it(`successfully`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(radioField);
                return request(app.getHttpServer())
                    .patch(`/adverts/${uuid()}`)
                    .send({
                        title: 'some advert',
                        fields: [
                            {
                                id: uuid(),
                                field_id: uuid(),
                                value: 'new text',
                            } as UpdateRadioDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.OK);
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
                                value: 'new text',
                            } as UpdateRadioDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('field_id must be an UUID');
                    });
            });

            it(`with error - not valid value`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(radioField);
                return request(app.getHttpServer())
                    .patch(`/adverts/${uuid()}`)
                    .send({
                        title: 'some advert',
                        fields: [
                            {
                                id: uuid(),
                                field_id: uuid(),
                                value: '',
                            } as UpdateRadioDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('value should not be empty');
                    });
            });

            it(`with error - value is too long`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(radioField);
                return request(app.getHttpServer())
                    .patch(`/adverts/${uuid()}`)
                    .send({
                        title: 'some advert',
                        fields: [
                            {
                                id: uuid(),
                                field_id: uuid(),
                                value: Array(256).fill('a').join(''),
                            } as UpdateRadioDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('value must be shorter than or equal to 255 characters');
                    });
            });

            it(`with error - id is not valid`, () => {
                return request(app.getHttpServer())
                    .patch(`/adverts/${uuid()}`)
                    .send({
                        title: 'some advert',
                        fields: [
                            {
                                id: '123',
                                field_id: uuid(),
                                value: '1234',
                            } as UpdateRadioDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('id must be an UUID');
                    });
            });

            it(`with error - field not found`, () => {
                fieldRepositoryMock.findOne.mockReturnValueOnce(undefined);
                return request(app.getHttpServer())
                    .patch(`/adverts/${uuid()}`)
                    .send({
                        title: 'some advert',
                        fields: [
                            {
                                id: uuid(),
                                field_id: uuid(),
                                value: '1234',
                            } as UpdateRadioDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.NOT_FOUND)
                    .expect(res => {
                        expect(res.body.message).toContain('Field not found');
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

        describe('update advert with price field', () => {
            const field = new Field();
            field.type = FieldType.PRICE;

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
                                value: 1000,
                            } as UpdatePriceDto,
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
                                value: 1000,
                            } as UpdatePriceDto,
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
                                value: 1000,
                            } as UpdatePriceDto,
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
                                value: -1000,
                            } as UpdatePriceDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('value must be a positive number');
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
                                value: 1000,
                            } as UpdatePriceDto,
                        ],
                    } as UpdateAdvertDto)
                    .expect(HttpStatus.OK);
            });
        });
    });

    describe('delete advert by id', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).delete(`/adverts/${uuid()}`).expect(HttpStatus.NO_CONTENT);
        });

        it(`with error - not valid uuid`, () => {
            return request(app.getHttpServer())
                .delete('/adverts/123123')
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('Validation failed (uuid  is expected)');
                });
        });

        it(`with error - not found`, () => {
            advertRepositoryMock.findOne.mockReturnValueOnce(undefined);
            return request(app.getHttpServer()).delete(`/adverts/${uuid()}`).expect(HttpStatus.NOT_FOUND);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});

describe('Adverts controller with ACL enabled', () => {
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
    advertEntity.userId = '123';

    const advertRepositoryMock = createRepositoryMock<Advert>([advertEntity]);
    const sectionRepositoryMock = createRepositoryMock<Section>([sectionEntity]);
    const fieldRepositoryMock = createRepositoryMock<Field>([fieldEntity]);
    const connectionMock = {
        manager: createRepositoryMock(),
    };
    const JwtGuard = JwtAuthGuardMock;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AdvertsModule, TypeOrmModule.forRoot(), AccessControlModule.forRoles(roles)],
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
            .overrideProvider(getRepositoryToken(PriceEntity))
            .useValue(createRepositoryMock())
            .overrideProvider(Connection)
            .useValue(connectionMock)
            .overrideGuard(JwtAuthGuard)
            .useValue(JwtGuard)
            .compile();

        app = await createTestAppForModule(moduleRef);
    });

    describe('get adverts', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).get('/adverts').expect(HttpStatus.OK);
        });
    });

    describe('get advert by id', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).get(`/adverts/${uuid()}`).expect(HttpStatus.OK);
        });
    });

    describe('create advert', () => {
        it(`successfully `, () => {
            return request(app.getHttpServer())
                .post(`/adverts`)
                .send({
                    model_id: uuid(),
                    category_id: uuid(),
                    title: 'some advert',
                    fields: [],
                } as CreateAdvertDto)
                .expect(HttpStatus.CREATED);
        });

        it(`with error - not owner of advert`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);

            return request(app.getHttpServer())
                .post(`/adverts`)
                .send({
                    model_id: '12312',
                    category_id: '123123',
                    title: '',
                    fields: [],
                } as CreateAdvertDto)
                .expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('update advert', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer())
                .patch(`/adverts/${uuid()}`)
                .send({
                    title: 'some advert',
                    fields: [],
                } as UpdateAdvertDto)
                .expect(HttpStatus.OK);
        });

        it(`with error - not owner of advert`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user'] };
                return true;
            });

            return request(app.getHttpServer())
                .patch(`/adverts/${uuid()}`)
                .send({
                    title: '123123',
                    fields: [],
                } as UpdateAdvertDto)
                .expect(HttpStatus.FORBIDDEN);
        });

        it(`successfully with admin permissions`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user', 'admin'] };
                return true;
            });

            return request(app.getHttpServer())
                .patch(`/adverts/${uuid()}`)
                .send({
                    title: '123123',
                    fields: [],
                } as UpdateAdvertDto)
                .expect(HttpStatus.OK);
        });
    });

    describe('delete advert by id', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).delete(`/adverts/${uuid()}`).expect(HttpStatus.NO_CONTENT);
        });

        it(`with error - not owner of advert`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user'] };
                return true;
            });

            return request(app.getHttpServer()).delete(`/adverts/${uuid()}`).expect(HttpStatus.FORBIDDEN);
        });

        it(`successfully with admin permissions`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: ['user', 'admin'] };
                return true;
            });

            return request(app.getHttpServer()).delete(`/adverts/${uuid()}`).expect(HttpStatus.NO_CONTENT);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
