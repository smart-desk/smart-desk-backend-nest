import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ModelsModule } from './models.module';
import { ModelsService } from './models.service';
import { Model } from './model.entity';
import { AppModule } from '../app.module';
import { ModelsController } from './models.controller';

describe('Models', () => {
    let app: INestApplication;
    const modelsService = {
        getAll: () => {
            const model = {
                id: 'id_string',
                name: 'name',
            };
            return [model];
        },
    };

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [],
            controllers: [ModelsController],
            providers: [ModelsService],
        })
            .overrideProvider(ModelsService)
            .useValue(modelsService)
            .compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    it(`/GET models`, () => {
        return request(app.getHttpServer())
            .get('/models')
            .expect(200)
            .expect(modelsService.getAll());
    });

    afterAll(async () => {
        await app.close();
    });
});
