import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { v4 as uuid } from 'uuid';
import { AccessControlModule } from 'nest-access-control';
import { createRepositoryMock, createTestAppForModule } from '../../test/test.utils';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtAuthGuardMock } from '../../test/mocks/jwt-auth.guard.mock';
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
import { InputTextEntity } from '../dynamic-fields/input-text/input-text.entity';
import { TextareaEntity } from '../dynamic-fields/textarea/textarea.entity';
import { RadioEntity } from '../dynamic-fields/radio/radio.entity';
import { PhotoEntity } from '../dynamic-fields/photo/photo.entity';
import { PriceEntity } from '../dynamic-fields/price/price.entity';
import { Connection } from 'typeorm';

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
    advertEntity.sections = [sectionEntity, sectionEntity];
    advertEntity.userId = '123';

    const bookmark = new Bookmark();
    bookmark.userId = '123';

    const advertRepositoryMock = createRepositoryMock<Advert>([advertEntity]);
    const sectionRepositoryMock = createRepositoryMock<Section>([sectionEntity]);
    const fieldRepositoryMock = createRepositoryMock<Field>([fieldEntity]);
    const bookmarkRepositoryMock = createRepositoryMock<Bookmark>([bookmark]);
    const connectionMock = {
        manager: createRepositoryMock(),
    };
    const JwtGuard = JwtAuthGuardMock;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [BookmarksModule, AdvertsModule, TypeOrmModule.forRoot(), AccessControlModule.forRoles(roles)],
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
            .overrideProvider(getRepositoryToken(Bookmark))
            .useValue(bookmarkRepositoryMock)
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
    });

    // todo fix it
    // describe('delete bookmarks by id', () => {
    //     it(`successfully`, () => {
    //         return request(app.getHttpServer())
    //             .delete(`/bookmarks/${uuid()}`)
    //             .expect(HttpStatus.NO_CONTENT);
    //     });
    // });

    afterAll(async () => {
        await app.close();
    });
});
