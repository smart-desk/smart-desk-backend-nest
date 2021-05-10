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
import { CreateAdvertDto } from '../../adverts/dto/create-advert.dto';
import { FieldType } from '../dynamic-fields.module';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { JwtAuthGuardMock } from '../../../../test/mocks/jwt-auth.guard.mock';
import { roles, RolesEnum } from '../../app/app.roles';
import { UsersModule } from '../../users/users.module';
import { User } from '../../users/entities/user.entity';
import { UpdateAdvertDto } from '../../adverts/dto/update-advert.dto';
import { FieldCreateDto, FieldUpdateDto } from '../../fields/dto/field.dto';
import { CreateDatepickerDto } from './dto/create-datepicker.dto';
import { UpdateDatepickerDto } from './dto/update-datepicker.dto';
import { DatepickerParamsDto } from './dto/datepicker-params.dto';
import { IsBoolean, IsDate, IsNotEmpty, IsOptional } from 'class-validator';

describe('Datepicker field', () => {
    let app: INestApplication;

    const fieldEntity = new Field();
    fieldEntity.type = FieldType.DATEPICKER;
    fieldEntity.id = uuid();
    fieldEntity.title = 'test';
    fieldEntity.params = {};

    const advertEntity = new Advert();
    advertEntity.id = '1234';
    advertEntity.userId = '123';

    const advertRepositoryMock = createRepositoryMock<Advert>([advertEntity]);
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
                                date1: new Date(),
                                date2: new Date(),
                            } as CreateDatepickerDto,
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
                        fields: [{ field_id: uuid() } as any],
                    } as CreateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('date1 should not be empty');
                        expect(res.body.message).toContain('date1 must be a Date instance');
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
                                date1: new Date(),
                                date2: new Date(),
                            } as UpdateDatepickerDto,
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
                            } as any,
                        ],
                    } as CreateAdvertDto)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect(res => {
                        expect(res.body.message).toContain('date1 should not be empty');
                        expect(res.body.message).toContain('date1 must be a Date instance');
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
                        title: 'some title',
                        type: FieldType.DATEPICKER,
                        params: { range: true } as DatepickerParamsDto,
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
                        type: FieldType.DATEPICKER,
                        params: {
                            range: false,
                        } as DatepickerParamsDto,
                    } as FieldUpdateDto)
                    .expect(HttpStatus.OK);
            });
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
