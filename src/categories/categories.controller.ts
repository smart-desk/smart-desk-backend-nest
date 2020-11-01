import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post
} from '@nestjs/common';
import { DeleteResult, UpdateResult } from 'typeorm';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Controller('categories')
export class CategoriesController {
    constructor(private categoriesService: CategoriesService) {}

    @Get()
    gerAll(): any {
        this.categoriesService.getAll();
    }

    @Post()
    create(@Body() createCategoryDto: CreateCategoryDto): any {
        this.categoriesService.create(createCategoryDto);
    }

    @Get(':id')
    async getOne(@Param('id') id: string): Promise<Category> {
        return this.categoriesService.getOne(id);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateCategoryDto: UpdateCategoryDto
    ): Promise<UpdateResult> {
        return this.categoriesService.update(id, updateCategoryDto);
    }

    @Delete(':id')
    async delete(@Param('id') id: string): Promise<DeleteResult> {
        return this.categoriesService.delete(id);
    }
}
