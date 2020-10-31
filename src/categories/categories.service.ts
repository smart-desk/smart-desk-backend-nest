import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Category, CategoryDto } from './entities';

@Injectable()
export class CategoriesService {
    private categories: CategoryDto[] = [];

    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>
    ) {}

    getAll() {
        return this.categories;
    }

    async getOne(id: string): Promise<Category> {
        const category = await this.categoryRepository.findOne(id);

        if (!category) {
            throw new NotFoundException(`Category doesn't exist`);
        }

        return category;
    }

    create(data: CategoryDto) {
        this.categories.push(data);
    }

    async update(id: string, data: CategoryDto): Promise<UpdateResult> {
        const category = await this.categoryRepository.update(id, data);

        return category;
    }

    delete(categoryId: string) {
        this.categories = this.categories.filter(({ id }) => id !== categoryId);

        return 'OK';
    }
}
