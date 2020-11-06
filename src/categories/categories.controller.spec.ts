import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

describe('CategoriesController', () => {
    let categoriesController: CategoriesController;
    let categoriesService: CategoriesService;

    beforeEach(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            controllers: [CategoriesController],
            providers: [CategoriesService, { provide: Connection, useValue: {} }, { provide: getRepositoryToken(Category), useValue: {} }],
        }).compile();

        categoriesController = moduleRef.get<CategoriesController>(CategoriesController);
        categoriesService = moduleRef.get<CategoriesService>(CategoriesService);
    });

    it('should be defined', () => {
        expect(categoriesController).toBeDefined();
    });
});
