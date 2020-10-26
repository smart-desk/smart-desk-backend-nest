import { Controller, Get } from '@nestjs/common';

@Controller('categories')
export class CategoriesController {

    @Get()
    getCategories(): any {
        return 'categories list';
    }
}