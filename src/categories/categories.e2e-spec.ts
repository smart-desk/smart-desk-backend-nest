import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { CategoriesModule } from './categories.module';
import { Category } from './entities/category.entity';

const CategoriesServiceMock = {
    create: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
};

describe('[Feature] Categories - /categories', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [CategoriesModule],
        })
            .overrideProvider(getRepositoryToken(Category))
            .useValue(CategoriesServiceMock)
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('Get all [GET /]', () => {
        request(app.getHttpServer()).get('/api/categories').send().expect(HttpStatus.OK);
    });

    it.todo('Create [POST /]');
    it.todo('Get one [GET /:id]');
    it.todo('Update one [PATCH /:id]');
    it.todo('Delete one [DELETE /:id]');

    afterAll(async () => {
        await app.close();
    });
});
