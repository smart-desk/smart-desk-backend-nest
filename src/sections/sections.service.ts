import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Section } from './section.entity';
import { SectionCreateDto } from './section.dto';

@Injectable()
export class SectionsService {
    constructor(@InjectRepository(Section) private sectionRepository: Repository<Section>) {}

    create(sectionDto: SectionCreateDto): Promise<Section> {
        const section = this.sectionRepository.create(sectionDto);
        return this.sectionRepository.save(section);
    }

    async delete(id: string): Promise<DeleteResult> {
        const section = await this.sectionRepository.findOne({ id });
        if (!section) {
            throw new NotFoundException('Section not found');
        }
        return this.sectionRepository.delete({ id });
    }
}
