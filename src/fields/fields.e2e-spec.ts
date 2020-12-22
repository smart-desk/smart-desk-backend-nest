import { ExecutionContext, HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { v4 as uuid } from 'uuid';
import { AccessControlModule, ACGuard } from 'nest-access-control';
import { createRepositoryMock, createTestAppForModule } from '../../test/test.utils';
import { FieldsModule } from './fields.module';
import { Field } from './field.entity';
import { FieldCreateDto, FieldUpdateDto } from './dto/field.dto';
import { SectionsModule } from '../sections/sections.module';
import { Section } from '../sections/section.entity';
import { InputTextParamsDto } from '../dynamic-fields/input-text/dto/input-text-params.dto';
import { TextareaParamsDto } from '../dynamic-fields/textarea/dto/textarea-params.dto';
import { TextParamsDto } from '../dynamic-fields/text/dto/text-params.dto';
import { RadioParamsDto } from '../dynamic-fields/radio/dto/radio-params.dto';
import { InputTextEntity } from '../dynamic-fields/input-text/input-text.entity';
import { TextareaEntity } from '../dynamic-fields/textarea/textarea.entity';
import { RadioEntity } from '../dynamic-fields/radio/radio.entity';
import { FieldType } from '../dynamic-fields/dynamic-fields.module';
import { PhotoEntity } from '../dynamic-fields/photo/photo.entity';
import { PriceEntity } from '../dynamic-fields/price/price.entity';
import { PriceParamsDto } from '../dynamic-fields/price/dto/price-params.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtAuthGuardMock } from '../../test/mocks/jwt-auth.guard.mock';
import { AcGuardMock } from '../../test/mocks/ac.guard.mock';
import { roles, RolesEnum } from '../app/app.roles';

describe('Fields controller', () => {
    let app: INestApplication;
    const field = new Field();
    const section = new Section();

    const fieldsRepositoryMock = createRepositoryMock<Field>([field]);
    const sectionRepositoryMock = createRepositoryMock<Section>([section]);

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [FieldsModule, SectionsModule],
        })
            .overrideProvider(getRepositoryToken(Field))
            .useValue(fieldsRepositoryMock)
            .overrideProvider(getRepositoryToken(Section))
            .useValue(sectionRepositoryMock)
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
            .overrideGuard(JwtAuthGuard)
            .useValue(JwtAuthGuardMock)
            .overrideGuard(ACGuard)
            .useValue(AcGuardMock)
            .compile();

        app = await createTestAppForModule(moduleRef);
    });

    describe('create field', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer())
                .post('/fields')
                .send({
                    section_id: uuid(),
                    title: 'some title',
                    type: FieldType.INPUT_TEXT,
                    params: { label: 'some label' } as InputTextParamsDto,
                } as FieldCreateDto)
                .expect(HttpStatus.CREATED);
        });

        it(`with error - wrong field type`, () => {
            return request(app.getHttpServer())
                .post('/fields')
                .send({
                    section_id: uuid(),
                    title: 'some title',
                    type: 'wrong type' as FieldType,
                    params: { label: 'some label' } as InputTextParamsDto,
                } as FieldCreateDto)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('type must be a valid enum value');
                });
        });

        it(`with error - not correct section_id`, () => {
            return request(app.getHttpServer())
                .post('/fields')
                .send({
                    section_id: 'not id',
                    title: 'some title',
                    type: FieldType.INPUT_TEXT,
                    params: { label: 'some label' } as InputTextParamsDto,
                } as FieldCreateDto)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('section_id must be an UUID');
                });
        });

        it(`with error - section_id not found`, () => {
            sectionRepositoryMock.findOne.mockReturnValueOnce(undefined);
            return request(app.getHttpServer())
                .post('/fields')
                .send({
                    section_id: uuid(),
                    title: 'some title',
                    type: FieldType.INPUT_TEXT,
                    params: { label: 'some label' } as InputTextParamsDto,
                } as FieldCreateDto)
                .expect(HttpStatus.NOT_FOUND)
                .expect(res => {
                    expect(res.body.message).toContain('Section not found');
                });
        });

        describe('type input_text', () => {
            it(`successfully`, () => {
                return request(app.getHttpServer())
                    .post('/fields')
                    .send({
                        section_id: uuid(),
                        title: 'some title',
                        type: FieldType.INPUT_TEXT,
                        params: {
                            label: 'some label',
                            placeholder: 'some place',
                            required: true,
                        } as InputTextParamsDto,
                    } as FieldCreateDto)
                    .expect(HttpStatus.CREATED);
            });

            it(`with errors - no label provided, required must be boolean`, () => {
                return request(app.getHttpServer())
                    .post('/fields')
                    .send({
                        section_id: uuid(),
                        title: 'some title',
                        type: FieldType.INPUT_TEXT,
                        params: {
                            label: '',
                            placeholder: 'some place',
                            required: 'string' as any,
                        } as InputTextParamsDto,
                    } as FieldCreateDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('label should not be empty');
                        expect(res.body.message).toContain('required must be a boolean value');
                    });
            });
        });

        describe('type textarea', () => {
            it(`successfully`, () => {
                return request(app.getHttpServer())
                    .post('/fields')
                    .send({
                        section_id: uuid(),
                        title: 'some title',
                        type: FieldType.TEXTAREA,
                        params: {
                            label: 'some label',
                            placeholder: 'some place',
                            required: true,
                        } as TextareaParamsDto,
                    } as FieldCreateDto)
                    .expect(HttpStatus.CREATED);
            });

            it(`with errors - no label provided, required must be boolean`, () => {
                return request(app.getHttpServer())
                    .post('/fields')
                    .send({
                        section_id: uuid(),
                        title: 'some title',
                        type: FieldType.TEXTAREA,
                        params: {
                            label: '',
                            placeholder: 'some place',
                            required: 'string' as any,
                        } as TextareaParamsDto,
                    } as FieldCreateDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('label should not be empty');
                        expect(res.body.message).toContain('required must be a boolean value');
                    });
            });
        });

        describe('type text', () => {
            it(`successfully`, () => {
                return request(app.getHttpServer())
                    .post('/fields')
                    .send({
                        section_id: uuid(),
                        title: 'some title',
                        type: FieldType.TEXT,
                        params: { value: 'some string' } as TextParamsDto,
                    } as FieldCreateDto)
                    .expect(HttpStatus.CREATED);
            });

            it(`with error - no empty value`, () => {
                return request(app.getHttpServer())
                    .post('/fields')
                    .send({
                        section_id: uuid(),
                        title: 'some title',
                        type: FieldType.TEXT,
                        params: { value: '' } as TextParamsDto,
                    } as FieldCreateDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('value should not be empty');
                    });
            });
        });

        describe('type radio', () => {
            it(`successfully`, () => {
                return request(app.getHttpServer())
                    .post('/fields')
                    .send({
                        section_id: uuid(),
                        title: 'some title',
                        type: FieldType.RADIO,
                        params: {
                            radios: [
                                {
                                    label: 'some label',
                                    value: 'some value',
                                },
                                {
                                    label: 'some label 1',
                                    value: 'some value 1',
                                },
                            ],
                        } as RadioParamsDto,
                    } as FieldCreateDto)
                    .expect(HttpStatus.CREATED);
            });

            it(`with errors - no empty title, no empty label, no empty value`, () => {
                return request(app.getHttpServer())
                    .post('/fields')
                    .send({
                        section_id: uuid(),
                        title: 'some title',
                        type: FieldType.RADIO,
                        params: {
                            radios: [
                                {
                                    label: '',
                                    value: 'some value',
                                },
                                {
                                    label: 'some label 1',
                                    value: '',
                                },
                            ],
                        } as RadioParamsDto,
                    } as FieldCreateDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('label should not be empty');
                        expect(res.body.message).toContain('value should not be empty');
                    });
            });
        });

        describe('type price', () => {
            it(`successfully`, () => {
                return request(app.getHttpServer())
                    .post('/fields')
                    .send({
                        section_id: uuid(),
                        title: 'some title',
                        type: FieldType.PRICE,
                        params: {
                            currency: 'USD',
                        } as PriceParamsDto,
                    } as FieldCreateDto)
                    .expect(HttpStatus.CREATED);
            });

            it(`with errors - not empty, must be a string and shorter then 10`, () => {
                return request(app.getHttpServer())
                    .post('/fields')
                    .send({
                        section_id: uuid(),
                        title: 'some title',
                        type: FieldType.PRICE,
                        params: {
                            currency: null,
                        } as PriceParamsDto,
                    } as FieldCreateDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('currency must be a string');
                        expect(res.body.message).toContain('currency should not be empty');
                        expect(res.body.message).toContain('currency must be shorter than or equal to 10 characters');
                    });
            });
        });
    });

    describe('update field', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer())
                .put(`/fields/${uuid()}`)
                .send({
                    title: 'some title',
                    type: FieldType.INPUT_TEXT,
                    params: { label: 'some label' } as InputTextParamsDto,
                } as FieldUpdateDto)
                .expect(HttpStatus.OK);
        });

        it(`with error - wrong field type`, () => {
            return request(app.getHttpServer())
                .put('/fields/12345')
                .send({
                    title: 'some title',
                    type: 'wrong type' as FieldType,
                    params: { label: 'some label' } as InputTextParamsDto,
                } as FieldUpdateDto)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('type must be a valid enum value');
                });
        });

        it(`with error - field not found`, () => {
            fieldsRepositoryMock.findOne.mockReturnValueOnce(undefined);
            return request(app.getHttpServer())
                .put(`/fields/${uuid()}`)
                .send({
                    title: 'some title',
                    type: FieldType.INPUT_TEXT,
                    params: { label: 'some label' } as InputTextParamsDto,
                } as FieldUpdateDto)
                .expect(HttpStatus.NOT_FOUND)
                .expect(res => {
                    expect(res.body.message).toContain('Field not found');
                });
        });

        describe('type input_text', () => {
            it(`successfully`, () => {
                return request(app.getHttpServer())
                    .put(`/fields/${uuid()}`)
                    .send({
                        title: 'some title',
                        type: FieldType.INPUT_TEXT,
                        params: {
                            label: 'some label',
                            placeholder: 'some place',
                            required: true,
                        } as InputTextParamsDto,
                    } as FieldUpdateDto)
                    .expect(HttpStatus.OK);
            });

            it(`with errors - no label provided, required must be boolean`, () => {
                return request(app.getHttpServer())
                    .put(`/fields/${uuid()}`)
                    .send({
                        title: 'some title',
                        type: FieldType.INPUT_TEXT,
                        params: {
                            label: '',
                            placeholder: 'some place',
                            required: 'string' as any,
                        } as InputTextParamsDto,
                    } as FieldUpdateDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('label should not be empty');
                        expect(res.body.message).toContain('required must be a boolean value');
                    });
            });
        });

        describe('type textarea', () => {
            it(`successfully`, () => {
                return request(app.getHttpServer())
                    .put(`/fields/${uuid()}`)
                    .send({
                        title: 'some title',
                        type: FieldType.TEXTAREA,
                        params: {
                            label: 'some label',
                            placeholder: 'some place',
                            required: true,
                        } as TextareaParamsDto,
                    } as FieldUpdateDto)
                    .expect(HttpStatus.OK);
            });

            it(`with errors - no label provided, required must be boolean`, () => {
                return request(app.getHttpServer())
                    .put(`/fields/${uuid()}`)
                    .send({
                        title: 'some title',
                        type: FieldType.TEXTAREA,
                        params: {
                            label: '',
                            placeholder: 'some place',
                            required: 'string' as any,
                        } as TextareaParamsDto,
                    } as FieldUpdateDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('label should not be empty');
                        expect(res.body.message).toContain('required must be a boolean value');
                    });
            });
        });

        describe('type text', () => {
            it(`successfully`, () => {
                return request(app.getHttpServer())
                    .put(`/fields/${uuid()}`)
                    .send({
                        title: 'some title',
                        type: FieldType.TEXT,
                        params: { value: 'some string' } as TextParamsDto,
                    } as FieldUpdateDto)
                    .expect(HttpStatus.OK);
            });

            it(`with error - no empty value`, () => {
                return request(app.getHttpServer())
                    .put(`/fields/${uuid()}`)
                    .send({
                        title: 'some title',
                        type: FieldType.TEXT,
                        params: { value: '' } as TextParamsDto,
                    } as FieldUpdateDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('value should not be empty');
                    });
            });
        });

        describe('type radio', () => {
            it(`successfully`, () => {
                return request(app.getHttpServer())
                    .put(`/fields/${uuid()}`)
                    .send({
                        title: 'some title',
                        type: FieldType.RADIO,
                        params: {
                            title: 'some title',
                            radios: [
                                {
                                    label: 'some label',
                                    value: 'some value',
                                },
                                {
                                    label: 'some label 1',
                                    value: 'some value 1',
                                },
                            ],
                        } as RadioParamsDto,
                    } as FieldUpdateDto)
                    .expect(HttpStatus.OK);
            });

            it(`with errors - no empty title, no empty label, no empty value`, () => {
                return request(app.getHttpServer())
                    .put(`/fields/${uuid()}`)
                    .send({
                        title: 'some title',
                        type: FieldType.RADIO,
                        params: {
                            radios: [
                                {
                                    label: '',
                                    value: 'some value',
                                },
                                {
                                    label: 'some label 1',
                                    value: '',
                                },
                            ],
                        } as RadioParamsDto,
                    } as FieldUpdateDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('label should not be empty');
                        expect(res.body.message).toContain('value should not be empty');
                    });
            });
        });

        describe('type price', () => {
            it(`successfully`, () => {
                return request(app.getHttpServer())
                    .put(`/fields/${uuid()}`)
                    .send({
                        title: 'some title',
                        type: FieldType.PRICE,
                        params: { currency: 'USD' } as PriceParamsDto,
                    } as FieldUpdateDto)
                    .expect(HttpStatus.OK);
            });

            it(`with errors - not empty, must be a string and shorter then 10`, () => {
                return request(app.getHttpServer())
                    .put(`/fields/${uuid()}`)
                    .send({
                        title: 'some title',
                        type: FieldType.PRICE,
                        params: { currency: null } as PriceParamsDto,
                    } as FieldUpdateDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('currency must be a string');
                        expect(res.body.message).toContain('currency should not be empty');
                        expect(res.body.message).toContain('currency must be shorter than or equal to 10 characters');
                    });
            });
        });
    });

    describe('delete field by id', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).delete(`/fields/${uuid()}`).expect(HttpStatus.NO_CONTENT);
        });

        it(`with error - not found`, () => {
            fieldsRepositoryMock.findOne.mockReturnValueOnce(undefined);
            return request(app.getHttpServer()).delete(`/fields/${uuid()}`).expect(HttpStatus.NOT_FOUND);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});


describe('Fields controller with ACL enabled', () => {
    let app: INestApplication;
    const field = new Field();
    const section = new Section();
    const JwtGuard = JwtAuthGuardMock;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [FieldsModule, SectionsModule, AccessControlModule.forRoles(roles)],
        })
            .overrideProvider(getRepositoryToken(Field))
            .useValue(createRepositoryMock([field]))
            .overrideProvider(getRepositoryToken(Section))
            .useValue(createRepositoryMock<Section>([section]))
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
            .overrideGuard(JwtAuthGuard)
            .useValue(JwtGuard)
            .compile();

        app = await createTestAppForModule(moduleRef);
    });

    describe('create field', () => {
        it(`successfully as admin`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: [RolesEnum.USER, RolesEnum.ADMIN] };
                return true;
            });

            return request(app.getHttpServer())
                .post('/fields')
                .send({
                    section_id: uuid(),
                    title: 'some title',
                    type: FieldType.INPUT_TEXT,
                    params: { label: 'some label' } as InputTextParamsDto,
                } as FieldCreateDto)
                .expect(HttpStatus.CREATED);
        });

        it(`with error for not logged in user`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer())
                .post('/fields')
                .send({
                    section_id: uuid(),
                    title: 'some title',
                    type: FieldType.INPUT_TEXT,
                    params: { label: 'some label' } as InputTextParamsDto,
                } as FieldCreateDto)
                .expect(HttpStatus.FORBIDDEN);
        });

        it(`with error not an admin`, () => {
            return request(app.getHttpServer())
                .post('/fields')
                .send({
                    section_id: uuid(),
                    title: 'some title',
                    type: FieldType.INPUT_TEXT,
                    params: { label: 'some label' } as InputTextParamsDto,
                } as FieldCreateDto)
                .expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('update field', () => {
        it(`successfully`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: [RolesEnum.USER, RolesEnum.ADMIN] };
                return true;
            });

            return request(app.getHttpServer())
                .put(`/fields/${uuid()}`)
                .send({
                    title: 'some title',
                    type: FieldType.INPUT_TEXT,
                    params: { label: 'some label' } as InputTextParamsDto,
                } as FieldUpdateDto)
                .expect(HttpStatus.OK);
        });

        it(`with error for not logged in user`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);

            return request(app.getHttpServer())
                .put('/fields/12345')
                .send({
                    title: 'some title',
                    type: FieldType.INPUT_TEXT,
                    params: { label: 'some label' } as InputTextParamsDto,
                } as FieldUpdateDto)
                .expect(HttpStatus.FORBIDDEN);
        });

        it(`with error not an admin`, () => {
            return request(app.getHttpServer())
                .put('/fields/12345')
                .send({
                    title: 'some title',
                    type: FieldType.INPUT_TEXT,
                    params: { label: 'some label' } as InputTextParamsDto,
                } as FieldUpdateDto)
                .expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('delete field by id', () => {
        it(`successfully`, () => {
            JwtGuard.canActivate.mockImplementationOnce((context: ExecutionContext) => {
                const req = context.switchToHttp().getRequest();
                req.user = { id: '007', email: 'test@email.com', roles: [RolesEnum.USER, RolesEnum.ADMIN] };
                return true;
            });

            return request(app.getHttpServer()).delete(`/fields/${uuid()}`).expect(HttpStatus.NO_CONTENT);
        });

        it(`with error for not logged in user`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).delete(`/fields/${uuid()}`).expect(HttpStatus.FORBIDDEN);
        });

        it(`with error not an admin`, () => {
            return request(app.getHttpServer()).delete(`/fields/${uuid()}`).expect(HttpStatus.FORBIDDEN);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});