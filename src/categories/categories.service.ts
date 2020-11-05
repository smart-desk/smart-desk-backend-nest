import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
    constructor(@InjectRepository(Category) private categoryRepository: Repository<Category>) {}

    findAll(): Promise<Category[]> {
        return this.categoryRepository.find();
    }

    async findOne(id: string): Promise<Category> {
        const category = await this.categoryRepository.findOne(id);

        if (!category) {
            throw new NotFoundException(`Category doesn't exist`);
        }

        return category;
    }

    create(createCategoryDto: CreateCategoryDto): Promise<Category> {
        const category = this.categoryRepository.create(createCategoryDto);
        return this.categoryRepository.save(category);
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        const category = await this.categoryRepository.preload({
            id,
            ...updateCategoryDto,
        });

        if (!category) {
            throw new NotFoundException(`Category doesn't exist`);
        }

        return this.categoryRepository.save(category);
    }

    async delete(id: string): Promise<Category> {
        const category = await this.findOne(id);
        return this.categoryRepository.remove(category);
    }
}
