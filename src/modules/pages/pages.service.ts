import { Injectable, NotFoundException } from '@nestjs/common';
import { Pages } from './entities/pages';
import { PageDto } from './dto/page.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class PagesService {
    constructor(@InjectRepository(Pages) private pagesRepository: Repository<Pages>) {}
    async getPages(): Promise<Pages[]> {
        return await this.pagesRepository.find();
    }

    async getPage(id: string): Promise<Pages> {
        const page = await this.pagesRepository.findOne({ id });
        if (!page) {
            throw new NotFoundException(`page ${id} not found`);
        }
        return page;
    }

    async createPage(body: PageDto): Promise<Pages> {
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
