import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { v4 as uuid } from 'uuid';
import { AccessControlModule } from 'nest-access-control';
import { createRepositoryMock, createTestAppForModule, declareCommonProviders } from '../../../test/test.utils';
import { JwtAuthGuardMock } from '../../../test/mocks/jwt-auth.guard.mock';
import { BookmarksModule } from './bookmarks.module';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { roles } from '../app/app.roles';
import { Field } from '../fields/field.entity';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Bookmark } from './entities/bookmark.entity';
import { Advert } from '../adverts/entities/advert.entity';
import { Section, SectionType } from '../sections/section.entity';
import { FieldType } from '../dynamic-fields/dynamic-fields.module';
import { AdvertsModule } from '../adverts/adverts.module';
import { Connection } from 'typeorm';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { UserStatus } from '../users/user-status.enum';

describe('Bookmarks controller', () => {
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
    advertEntity.model_id = '12323';
    advertEntity.sections = [sectionEntity, sectionEntity];
    advertEntity.userId = '123';

    const bookmark = new Bookmark();
    bookmark.userId = '123';
    bookmark.advert = advertEntity;

    const advertRepositoryMock = createRepositoryMock<Advert>([advertEntity]);
    const sectionRepositoryMock = createRepositoryMock<Section>([sectionEntity]);
    const fieldRepositoryMock = createRepositoryMock<Field>([fieldEntity]);
    const bookmarkRepositoryMock = createRepositoryMock<Bookmark>([bookmark]);
    const connectionMock = {
        manager: createRepositoryMock(),
    };
    const userRepositoryMock = createRepositoryMock<User>([new User()]);
    const JwtGuard = JwtAuthGuardMock;

    beforeAll(async () => {
        let moduleBuilder = Test.createTestingModule({
            imports: [BookmarksModule, AdvertsModule, TypeOrmModule.forRoot(), AccessControlModule.forRoles(roles)],
        });

        const moduleRef = await declareCommonProviders(moduleBuilder)
            .overrideProvider(getRepositoryToken(Advert))
            .useValue(advertRepositoryMock)
            .overrideProvider(getRepositoryToken(Section))
            .useValue(sectionRepositoryMock)
            .overrideProvider(getRepositoryToken(Field))
            .useValue(fieldRepositoryMock)
            .overrideProvider(getRepositoryToken(Bookmark))
            .useValue(bookmarkRepositoryMock)
            .overrideProvider(getRepositoryToken(User))
            .useValue(userRepositoryMock)
            .overrideProvider(Connection)
            .useValue(connectionMock)
            .overrideGuard(JwtAuthGuard)
            .useValue(JwtGuard)
            .compile();

        app = await createTestAppForModule(moduleRef);
    });

    describe('create bookmark', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer())
                .post('/bookmarks')
                .send({
                    advertId: uuid(),
                } as CreateBookmarkDto)
                .expect(HttpStatus.CREATED);
        });

        it(`with error - wrong advert id`, () => {
            return request(app.getHttpServer())
                .post('/bookmarks')
                .send({
                    advertId: '123123123',
                } as CreateBookmarkDto)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('advertId must be an UUID');
                });
        });

        it(`with error - unauthorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);

            return request(app.getHttpServer())
                .post('/bookmarks')
                .send({
                    advertId: uuid(),
                } as CreateBookmarkDto)
                .expect(HttpStatus.FORBIDDEN);
        });

        it(`with error - user blocked`, () => {
            const user = new User();
            user.status = UserStatus.BLOCKED;
            userRepositoryMock.findOne.mockReturnValueOnce(user);

            return request(app.getHttpServer())
                .post('/bookmarks')
                .send({
                    advertId: uuid(),
                } as CreateBookmarkDto)
                .expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('delete bookmarks by id', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).delete(`/bookmarks/${uuid()}`).expect(HttpStatus.NO_CONTENT);
        });

        it(`with error - user blocked`, () => {
            const user = new User();
            user.status = UserStatus.BLOCKED;
            userRepositoryMock.findOne.mockReturnValueOnce(user);

            return request(app.getHttpServer()).delete(`/bookmarks/${uuid()}`).expect(HttpStatus.FORBIDDEN);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
