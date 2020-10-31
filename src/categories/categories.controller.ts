import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './category.entity';

@Controller('categories')
export class CategoriesController {
    constructor(private categoriesService: CategoriesService) {}
    @Get()
    getCategoryList(): any {
        return '[GET] category list';
    }

    @Post()
    createCategory(@Body() categoryDto: any): any {
        return `[POST] Create category: ${JSON.stringify(categoryDto)}`;
    }

    @Get(':id')
    async getCategoryById(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<Category> {
        return await this.categoriesService.getCategory(id);
    }

    @Put(':id')
    updateCategory(
        @Param('id', ParseIntPipe) id: number,
        @Body() categoryDto: any,
    ): any {
        return `[PUT] Update category by id: ${id}, ${JSON.stringify(
            categoryDto,
        )}`;
    }

    @Delete(':id')
    deleteCategory(@Param('id', ParseIntPipe) id: number): any {
        return `[DELETE] Delete category by id : ${id}`;
    }
}
