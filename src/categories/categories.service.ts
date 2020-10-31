import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
    private categories: CreateCategoryDto[] = [];

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

    create(data: CreateCategoryDto) {
        this.categories.push(data);
    }

    async update(id: string, data: CreateCategoryDto): Promise<UpdateResult> {
        const category = await this.categoryRepository.update(id, data);

        return category;
    }

    delete(categoryId: string) {
        this.categories = this.categories.filter(({ id }) => id !== categoryId);

        return 'OK';
    }
}
