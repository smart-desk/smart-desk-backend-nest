import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { v4 as uuid } from 'uuid';
import fn = jest.fn;
import { createRepositoryMock, createTestAppForModule } from '../../test/test.utils';
import { FieldsModule } from './fields.module';
import { Field } from './field.entity';
import { FieldCreateDto, FieldUpdateDto } from './dto/field.dto';
import { SectionsModule } from '../sections/sections.module';
import { Section } from '../sections/section.entity';
import { FieldType } from './constants';
import { InputTextDto } from './dto/input-text.dto';
import { TextareaDto } from './dto/textarea.dto';
import { TextDto } from './dto/text.dto';
import { RadioDto } from './dto/radio.dto';

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
                    params: { label: 'some label' } as InputTextDto,
                } as FieldCreateDto)
                .expect(201);
        });

        it(`with error - wrong field type`, () => {
            return request(app.getHttpServer())
                .post('/fields')
                .send({
                    section_id: uuid(),
                    title: 'some title',
                    type: 'wrong type' as FieldType,
                    params: { label: 'some label' } as InputTextDto,
                } as FieldCreateDto)
                .expect(400)
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
                    params: { label: 'some label' } as InputTextDto,
                } as FieldCreateDto)
                .expect(400)
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
                    params: { label: 'some label' } as InputTextDto,
                } as FieldCreateDto)
                .expect(404)
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
                        } as InputTextDto,
                    } as FieldCreateDto)
                    .expect(201);
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
                        } as InputTextDto,
                    } as FieldCreateDto)
                    .expect(400)
                    .expect(res => {
                        expect(res.body.message).toContain('params.label should not be empty');
                        expect(res.body.message).toContain('params.required must be a boolean value');
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
                        } as TextareaDto,
                    } as FieldCreateDto)
                    .expect(201);
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
                        } as TextareaDto,
                    } as FieldCreateDto)
                    .expect(400)
                    .expect(res => {
                        expect(res.body.message).toContain('params.label should not be empty');
                        expect(res.body.message).toContain('params.required must be a boolean value');
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
                        params: { value: 'some string' } as TextDto,
                    } as FieldCreateDto)
                    .expect(201);
            });

            it(`with error - no empty value`, () => {
                return request(app.getHttpServer())
                    .post('/fields')
                    .send({
                        section_id: uuid(),
                        title: 'some title',
                        type: FieldType.TEXT,
                        params: { value: '' } as TextDto,
                    } as FieldCreateDto)
                    .expect(400)
                    .expect(res => {
                        expect(res.body.message).toContain('params.value should not be empty');
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
                        } as RadioDto,
                    } as FieldCreateDto)
                    .expect(201);
            });

            it(`with errors - no empty title, no empty label, no empty value`, () => {
                return request(app.getHttpServer())
                    .post('/fields')
                    .send({
                        section_id: uuid(),
                        title: 'some title',
                        type: FieldType.RADIO,
                        params: {
                            title: '',
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
                        } as RadioDto,
                    } as FieldCreateDto)
                    .expect(400)
                    .expect(res => {
                        expect(res.body.message).toContain('params.title should not be empty');
                        expect(res.body.message).toContain('0.label should not be empty');
                        expect(res.body.message).toContain('1.value should not be empty');
                    });
            });
        });
    });

    describe('update field', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer())
                .put('/fields/12345')
                .send({
                    title: 'some title',
                    type: FieldType.INPUT_TEXT,
                    params: { label: 'some label' } as InputTextDto,
                } as FieldUpdateDto)
                .expect(200);
        });

        it(`with error - wrong field type`, () => {
            return request(app.getHttpServer())
                .put('/fields/12345')
                .send({
                    title: 'some title',
                    type: 'wrong type' as FieldType,
                    params: { label: 'some label' } as InputTextDto,
                } as FieldUpdateDto)
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toContain('type must be a valid enum value');
                });
        });

        it(`with error - field not found`, () => {
            fieldsRepositoryMock.findOne.mockReturnValueOnce(undefined);
            return request(app.getHttpServer())
                .put('/fields/123123123')
                .send({
                    title: 'some title',
                    type: FieldType.INPUT_TEXT,
                    params: { label: 'some label' } as InputTextDto,
                } as FieldUpdateDto)
                .expect(404)
                .expect(res => {
                    expect(res.body.message).toContain('Field not found');
                });
        });

        describe('type input_text', () => {
            it(`successfully`, () => {
                return request(app.getHttpServer())
                    .put('/fields/12312323')
                    .send({
                        title: 'some title',
                        type: FieldType.INPUT_TEXT,
                        params: {
                            label: 'some label',
                            placeholder: 'some place',
                            required: true,
                        } as InputTextDto,
                    } as FieldUpdateDto)
                    .expect(200);
            });

            it(`with errors - no label provided, required must be boolean`, () => {
                return request(app.getHttpServer())
                    .put('/fields/123321323')
                    .send({
                        title: 'some title',
                        type: FieldType.INPUT_TEXT,
                        params: {
                            label: '',
                            placeholder: 'some place',
                            required: 'string' as any,
                        } as InputTextDto,
                    } as FieldUpdateDto)
                    .expect(400)
                    .expect(res => {
                        expect(res.body.message).toContain('params.label should not be empty');
                        expect(res.body.message).toContain('params.required must be a boolean value');
                    });
            });
        });

        describe('type textarea', () => {
            it(`successfully`, () => {
                return request(app.getHttpServer())
                    .put('/fields/1231231')
                    .send({
                        title: 'some title',
                        type: FieldType.TEXTAREA,
                        params: {
                            label: 'some label',
                            placeholder: 'some place',
                            required: true,
                        } as TextareaDto,
                    } as FieldUpdateDto)
                    .expect(200);
            });

            it(`with errors - no label provided, required must be boolean`, () => {
                return request(app.getHttpServer())
                    .put('/fields/123123123')
                    .send({
                        title: 'some title',
                        type: FieldType.TEXTAREA,
                        params: {
                            label: '',
                            placeholder: 'some place',
                            required: 'string' as any,
                        } as TextareaDto,
                    } as FieldUpdateDto)
                    .expect(400)
                    .expect(res => {
                        expect(res.body.message).toContain('params.label should not be empty');
                        expect(res.body.message).toContain('params.required must be a boolean value');
                    });
            });
        });

        describe('type text', () => {
            it(`successfully`, () => {
                return request(app.getHttpServer())
                    .put('/fields/12312312')
                    .send({
                        title: 'some title',
                        type: FieldType.TEXT,
                        params: { value: 'some string' } as TextDto,
                    } as FieldUpdateDto)
                    .expect(200);
            });

            it(`with error - no empty value`, () => {
                return request(app.getHttpServer())
                    .put('/fields/123123')
                    .send({
                        title: 'some title',
                        type: FieldType.TEXT,
                        params: { value: '' } as TextDto,
                    } as FieldUpdateDto)
                    .expect(400)
                    .expect(res => {
                        expect(res.body.message).toContain('params.value should not be empty');
                    });
            });
        });

        describe('type radio', () => {
            it(`successfully`, () => {
                return request(app.getHttpServer())
                    .put('/fields/1231231')
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
                        } as RadioDto,
                    } as FieldUpdateDto)
                    .expect(200);
            });

            it(`with errors - no empty title, no empty label, no empty value`, () => {
                return request(app.getHttpServer())
                    .put('/fields/123123')
                    .send({
                        title: 'some title',
                        type: FieldType.RADIO,
                        params: {
                            title: '',
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
                        } as RadioDto,
                    } as FieldUpdateDto)
                    .expect(400)
                    .expect(res => {
                        expect(res.body.message).toContain('params.title should not be empty');
                        expect(res.body.message).toContain('0.label should not be empty');
                        expect(res.body.message).toContain('1.value should not be empty');
                    });
            });
        });
    });

    describe('delete field by id', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).delete('/fields/123123').expect(204);
        });

        it(`with error - not found`, () => {
            fieldsRepositoryMock.findOne.mockReturnValueOnce(undefined);
            return request(app.getHttpServer()).delete('/fields/123123').expect(404);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
