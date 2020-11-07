import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Controller('categories')
@ApiTags('Categories')
export class CategoriesController {
    constructor(private categoriesService: CategoriesService) {}

    @Get()
    getAll(): Promise<Category[]> {
        return this.categoriesService.findAll();
    }

    @Post()
    create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
        return this.categoriesService.create(createCategoryDto);
    }

    @Get(':id')
    getOne(@Param('id') id: string): Promise<Category> {
        return this.categoriesService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        return this.categoriesService.update(id, updateCategoryDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string): Promise<Category> {
        return this.categoriesService.delete(id);
    }
}
