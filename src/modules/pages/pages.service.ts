import { Injectable, NotFoundException } from '@nestjs/common';
import { Page } from './entities/page';
import { PageDto } from './dto/page.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class PagesService {
    constructor(@InjectRepository(Page) private pagesRepository: Repository<Page>) {}
    async getPages(): Promise<Page[]> {
        return await this.pagesRepository.find();
    }

    async getPage(id: string): Promise<Page> {
        const page = await this.pagesRepository.findOne({ id });
        if (!page) {
            throw new NotFoundException(`page ${id} not found`);
        }
        return page;
    }

    async createPage(body: PageDto): Promise<Page> {
        const pagesEntity = this.pagesRepository.create({ ...body });
        return await this.pagesRepository.save(pagesEntity);
    }
    updatePage(id: string, body: PageDto): Promise<UpdateResult> {
        return this.pagesRepository.update(id, body);
    }

    deletePage(id: string): Promise<DeleteResult> {
        return this.pagesRepository.delete(id);
    }
}
