import { ExecutionContext, HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { v4 as uuid } from 'uuid';
import { AccessControlModule, ACGuard } from 'nest-access-control';
import { createRepositoryMock, createTestAppForModule, declareCommonProviders } from '../../../test/test.utils';
import { FieldsModule } from './fields.module';
import { Field } from './field.entity';
import { FieldCreateDto, FieldUpdateDto } from './dto/field.dto';
import { SectionsModule } from '../sections/sections.module';
import { Section } from '../sections/section.entity';
import { InputTextParamsDto } from '../dynamic-fields/input-text/dto/input-text-params.dto';
import { FieldType } from '../dynamic-fields/dynamic-fields.module';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { JwtAuthGuardMock } from '../../../test/mocks/jwt-auth.guard.mock';
import { AcGuardMock } from '../../../test/mocks/ac.guard.mock';
import { roles, RolesEnum } from '../app/app.roles';

describe('Fields controller', () => {
    let app: INestApplication;
    const field = new Field();
    const section = new Section();

    const fieldsRepositoryMock = createRepositoryMock<Field>([field]);
    const sectionRepositoryMock = createRepositoryMock<Section>([section]);

    beforeAll(async () => {
        let moduleBuilder = Test.createTestingModule({
            imports: [FieldsModule, SectionsModule],
        });

        const moduleRef = await declareCommonProviders(moduleBuilder)
            .overrideProvider(getRepositoryToken(Field))
            .useValue(fieldsRepositoryMock)
            .overrideProvider(getRepositoryToken(Section))
            .useValue(sectionRepositoryMock)
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
                    order: 1,
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

        it(`with error - order is not valid`, () => {
            return request(app.getHttpServer())
                .post('/fields')
                .send({
                    section_id: uuid(),
                    title: 'some title',
                    type: FieldType.INPUT_TEXT,
                    order: 'test' as any,
                    params: { label: 'some label' } as InputTextParamsDto,
                } as FieldCreateDto)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('order must be an integer number');
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
                .put(`/fields/${uuid()}`)
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

// todo put it together
describe('Fields controller with ACL enabled', () => {
    let app: INestApplication;
    const field = new Field();
    const section = new Section();
    const JwtGuard = JwtAuthGuardMock;

    beforeAll(async () => {
        let moduleBuilder = Test.createTestingModule({
            imports: [FieldsModule, SectionsModule, AccessControlModule.forRoles(roles)],
        })
            .overrideProvider(getRepositoryToken(Field))
            .useValue(createRepositoryMock([field]))
            .overrideProvider(getRepositoryToken(Section))
            .useValue(createRepositoryMock([section]))
            .overrideGuard(JwtAuthGuard)
            .useValue(JwtGuard);

        moduleBuilder = declareCommonProviders(moduleBuilder);

        const moduleRef = await moduleBuilder.compile();
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
