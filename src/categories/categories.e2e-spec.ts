import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesModule } from './categories.module';

describe('[Feature] Categories - /categories', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [CategoriesModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it.todo('Get all [GET /]');
    it.todo('Create [POST /]');
    it.todo('Get one [GET /:id]');
    it.todo('Update one [PATCH /:id]');
    it.todo('Delete one [DELETE /:id]');

    afterAll(async () => {
        await app.close();
    });
});
