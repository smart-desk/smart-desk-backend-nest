import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
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

    async update(id: string, data: UpdateCategoryDto): Promise<UpdateResult> {
        await this.findOne(id);
        return this.categoryRepository.update(id, data);
    }

    async delete(id: string): Promise<DeleteResult> {
        await this.findOne(id);
        return this.categoryRepository.delete(id);
    }
}
