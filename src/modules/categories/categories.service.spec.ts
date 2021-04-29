import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    preload: jest.fn(),
});

const CATEGORIES: Category[] = [
    {
        id: '1',
        modelId: '123e4567-e89b-12d3-a456-426614174000',
        parentId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Category 1',
        createdAt: '2004-10-19 10:23:54',
        updatedAt: '2004-10-19 10:23:54',
    },
    {
        id: '2',
        modelId: '123e4567-e89b-12d3-a456-426614174000',
        parentId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Category 2',
        createdAt: '2004-10-19 10:23:54',
        updatedAt: '2004-10-19 10:23:54',
    },
];

// @chekit todo maybe we should rewrite this and test controller instead of service
describe('CategoriesService', () => {
    let categoriesService: CategoriesService;
    let categoryRepository: MockRepository;

    beforeEach(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            providers: [
                CategoriesService,
                { provide: Connection, useValue: {} },
                { provide: getRepositoryToken(Category), useValue: createMockRepository() },
            ],
        }).compile();

        categoriesService = moduleRef.get<CategoriesService>(CategoriesService);
        categoryRepository = moduleRef.get<MockRepository>(getRepositoryToken(Category));
    });

    it('should be defined', () => {
        expect(categoriesService).toBeDefined();
    });

    describe('findOne', () => {
        it('should fetch category by id', async () => {
            const categoryId = '1';
            const expectedCategory = CATEGORIES[0];
            categoryRepository.findOne.mockReturnValue(expectedCategory);

            const category = await categoriesService.findOne(categoryId);
            expect(category).toEqual(expectedCategory);
        });

        it('should throw an error', async () => {
            const categoryId = '1';
            categoryRepository.findOne.mockReturnValue(undefined);

            try {
                await categoriesService.findOne(categoryId);
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundException);
                expect(e.message).toEqual(`Category ${categoryId} doesn't exist`);
            }
        });
    });

    describe('update', () => {
        it('should update category', async () => {
            const categoryId = '2';
            const expectedCategory = {
                ...CATEGORIES[1],
                name: 'Updated name',
            };
            categoryRepository.preload.mockReturnValue(expectedCategory);
            categoryRepository.save.mockReturnValue(expectedCategory);

            const category = await categoriesService.update(categoryId, { name: 'Updated name' });
            expect(category.name).toEqual('Updated name');
        });

        it('should throw an error', async () => {
            const categoryId = '1';
            categoryRepository.preload.mockReturnValue(undefined);

            try {
                await categoriesService.findOne(categoryId);
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundException);
                expect(e.message).toEqual(`Category ${categoryId} doesn't exist`);
            }
        });
    });
});
