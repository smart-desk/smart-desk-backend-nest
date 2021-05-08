import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { ExecutionContext, HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { v4 as uuid } from 'uuid';
import { Connection } from 'typeorm';
import { AccessControlModule } from 'nest-access-control';
import { createRepositoryMock, createTestAppForModule, declareCommonProviders } from '../../../../test/test.utils';
import { Advert } from '../../adverts/entities/advert.entity';
import { AdvertsModule } from '../../adverts/adverts.module';
import { Field } from '../../fields/field.entity';
import { Section, SectionType } from '../../sections/section.entity';
import { CreateAdvertDto } from '../../adverts/dto/create-advert.dto';
import { FieldType } from '../dynamic-fields.module';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { JwtAuthGuardMock } from '../../../../test/mocks/jwt-auth.guard.mock';
import { roles, RolesEnum } from '../../app/app.roles';
import { UsersModule } from '../../users/users.module';
import { User } from '../../users/entities/user.entity';
import { UpdateAdvertDto } from '../../adverts/dto/update-advert.dto';
import { FieldCreateDto, FieldUpdateDto } from '../../fields/dto/field.dto';
import { CreateInputTextDto } from './dto/create-input-text.dto';
import { UpdateInputTextDto } from './dto/update-input-text.dto';
import { InputTextParamsDto } from './dto/input-text-params.dto';

describe('Input text field', () => {
    let app: INestApplication;

    const fieldEntity = new Field();
    fieldEntity.type = FieldType.INPUT_TEXT;
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
    });

    describe('Fields controller', () => {
        describe('create input_text field', () => {
            it(`successfully`, () => {
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
                        params: {
                            placeholder: 'some place',
                        } as InputTextParamsDto,
                    } as FieldCreateDto)
                    .expect(HttpStatus.CREATED);
            });
        });

        describe('update input_text field', () => {
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
                        params: {
                            placeholder: 'some place',
                        } as InputTextParamsDto,
                    } as FieldUpdateDto)
                    .expect(HttpStatus.OK);
            });
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
