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

@Controller('categories')
export class CategoriesController {
    @Get()
    getCategoryList(): any {
        return '[GET] category list';
    }

    @Post()
    createCategory(@Body() categoryDto: any): any {
        return `[POST] Create category: ${JSON.stringify(categoryDto)}`;
    }

    @Get(':id')
    getCategoryById(@Param('id', ParseIntPipe) id: number): any {
        return `[GET] Category by id: ${id}`;
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
