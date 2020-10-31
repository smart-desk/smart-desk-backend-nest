import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    async getOne(id: number): Promise<Category> {
        return this.categoryRepository.findOne(id);
    }

    create(data: CategoryDto) {}

    update(id: number, data: CategoryDto) {}

    delete(id: number) {}
}
