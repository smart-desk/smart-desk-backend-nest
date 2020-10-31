import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './entities/category.entity';

@Controller('categories')
export class CategoriesController {
    constructor(private categoriesService: CategoriesService) {}

    @Get()
    gerAll(): any {
        this.categoriesService.getAll();
    }

    @Post()
    create(@Body() body: CreateCategoryDto): any {
        this.categoriesService.create(body);
    }

    @Get(':id')
    async getOne(@Param('id') id: string): Promise<Category> {
        return this.categoriesService.getOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() body: any): any {
        return this.categoriesService.update(id, body);
    }

    @Delete(':id')
    delete(@Param('id') id: string): any {
        return this.categoriesService.delete(id);
    }
}
