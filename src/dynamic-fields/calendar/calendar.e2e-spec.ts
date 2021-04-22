import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { ExecutionContext, HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { v4 as uuid } from 'uuid';
import { Connection } from 'typeorm';
import { AccessControlModule } from 'nest-access-control';
import { createRepositoryMock, createTestAppForModule, declareDynamicFieldsProviders } from '../../../test/test.utils';
import { Advert } from '../../adverts/entities/advert.entity';
import { AdvertsModule } from '../../adverts/adverts.module';
import { Field } from '../../fields/field.entity';
import { Section, SectionType } from '../../sections/section.entity';
import { CreateAdvertDto } from '../../adverts/dto/create-advert.dto';
import { FieldType } from '../dynamic-fields.module';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { JwtAuthGuardMock } from '../../../test/mocks/jwt-auth.guard.mock';
import { roles, RolesEnum } from '../../app/app.roles';
import { UsersModule } from '../../users/users.module';
import { User } from '../../users/entities/user.entity';
import { UpdateAdvertDto } from '../../adverts/dto/update-advert.dto';
import { FieldCreateDto, FieldUpdateDto } from '../../fields/dto/field.dto';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { CalendarParamsDto } from './dto/calendar-params.dto';
import { IsBoolean, IsDate, IsNotEmpty, IsOptional } from 'class-validator';

describe('Calendar field', () => {
    let app: INestApplication;

    const fieldEntity = new Field();
    fieldEntity.type = FieldType.CALENDAR;
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
        })
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
            .useValue(JwtGuard);

        moduleBuilder = declareDynamicFieldsProviders(moduleBuilder);

        const moduleRef = await moduleBuilder.compile();
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
                                range: true,
                                date1: new Date(),
                                date2: new Date(),
                            } as CreateCalendarDto,
                        ],
                    } as CreateAdvertDto)
                    // .expect(HttpStatus.CREATED);
                    .expect(res => {
                        console.log(res.body)
                    });
            });

            it(`with error - not valid field`, () => {
                return request(app.getHttpServer())
                    .post(`/adverts`)
                    .send({
                        model_id: uuid(),
                        category_id: uuid(),
                        title: 'some advert',
                        fields: [{ field_id: uuid() } as any],
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
                                range: true,
                                date1: new Date(),
                                date2: new Date(),
                            } as UpdateCalendarDto,
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
                                range: true,
                                date1: new Date(),
                                date2: new Date(),
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

    describe('Fields controller', () => {
        describe('create field', () => {
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
                        type: FieldType.CALENDAR,
                        params: {} as CalendarParamsDto,
                    } as FieldCreateDto)
                    .expect(HttpStatus.CREATED);
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
                        type: FieldType.CALENDAR,
                        params: {
                            range: true,
                            date1: new Date(),
                            date2: new Date()
                        } as UpdateCalendarDto,
                    } as FieldUpdateDto)
                    .expect(HttpStatus.OK);
            });
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
