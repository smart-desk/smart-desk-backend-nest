import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { v4 as uuid } from 'uuid';
import fn = jest.fn;
import { createTestAppForModule } from '../../test/test.utils';
import { Section, SectionType } from './section.entity';
import { SectionsModule } from './sections.module';

describe('Sections controller', () => {
    let app: INestApplication;
    const sectionEntity = new Section();

    const sectionRepositoryMock = {
        findOne: fn().mockReturnValue(sectionEntity),
        create: fn().mockReturnValue(sectionEntity),
        save: fn().mockReturnValue(sectionEntity),
        delete: fn(),
    };

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [SectionsModule],
        })
            .overrideProvider(getRepositoryToken(Section))
            .useValue(sectionRepositoryMock)
            .compile();

        app = await createTestAppForModule(moduleRef);
    });

    describe('create section', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).post('/sections').send({ type: SectionType.PARAMS, model_id: uuid() }).expect(201);
        });

        it(`with error - wrong type`, () => {
            return request(app.getHttpServer())
                .post('/sections')
                .send({ type: 'wrong_type', model_id: uuid() })
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toContain('type must be a valid enum value');
                });
        });

        it(`with error - wrong model_id`, () => {
            return request(app.getHttpServer())
                .post('/sections')
                .send({ type: SectionType.PARAMS, model_id: '12312312' })
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toContain('model_id must be an UUID');
                });
        });
    });

    describe('delete section by id', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).delete('/sections/123123').expect(204);
        });

        it(`with error - not found`, () => {
            sectionRepositoryMock.findOne.mockReturnValueOnce(undefined);
            return request(app.getHttpServer()).delete('/sections/123123').expect(404);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
