import { Injectable, NotFoundException } from '@nestjs/common';
import { PageEntity } from './entities/page.entity';
import { PageDto } from './dto/page.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class PagesService {
    constructor(@InjectRepository(PageEntity) private pagesRepository: Repository<PageEntity>) {}
    async getPages(): Promise<PageEntity[]> {
        return await this.pagesRepository.createQueryBuilder('pages').select(['pages.title', 'pages.id']).getMany();
    }

    async getPage(id: string): Promise<PageEntity> {
        const page = await this.pagesRepository.findOne({ id });
        if (!page) {
            throw new NotFoundException(`page ${id} not found`);
        }
        return page;
    }

    async createPage(body: PageDto): Promise<PageEntity> {
        const pageEntity = this.pagesRepository.create({ ...body });
        return await this.pagesRepository.save(pageEntity);
    }

    async updatePage(id: string, body: PageDto): Promise<PageEntity> {
        const pageEntity = await this.pagesRepository.preload({ id, ...body });
        return this.pagesRepository.save(pageEntity);
    }

    deletePage(id: string): Promise<DeleteResult> {
        return this.pagesRepository.delete(id);
    }
}
