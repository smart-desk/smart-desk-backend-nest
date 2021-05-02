import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bookmark } from './entities/bookmark.entity';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { AdvertsService } from '../adverts/adverts.service';

@Injectable()
export class BookmarksService {
    constructor(@InjectRepository(Bookmark) private bookmarkRepository: Repository<Bookmark>, private advertsService: AdvertsService) {}

    async getUserBookmarks(userId: string): Promise<Bookmark[]> {
        const bookmarks = await this.bookmarkRepository.find({
            where: {
                userId,
            },
        });

        for (let i = 0; i < bookmarks.length; i += 1) {
            bookmarks[i].advert = await this.advertsService.loadFieldDataForAdvert(bookmarks[i].advert);
        }

        return bookmarks;
    }

    async createBookmark(userId: string, bookmark: CreateBookmarkDto): Promise<Bookmark> {
        const bookmarkEntity = this.bookmarkRepository.create({ userId, ...bookmark });
        const createdBookmarkEntity = await this.bookmarkRepository.save(bookmarkEntity);
        const createdBookmark = await this.bookmarkRepository.findOne({ id: createdBookmarkEntity.id });
        createdBookmark.advert = await this.advertsService.loadFieldDataForAdvert(createdBookmark.advert);
        return createdBookmark;
    }

    async deleteBookmark(id: string): Promise<Bookmark> {
        const bookmark = await this.findOneOrThrowException(id);
        return this.bookmarkRepository.remove(bookmark);
    }

    async getBookmarkOwner(id: string): Promise<string> {
        const bookmark = await this.findOneOrThrowException(id);
        return bookmark.userId;
    }

    private async findOneOrThrowException(id: string): Promise<Bookmark> {
        const bookmark = await this.bookmarkRepository.findOne({ id });
        if (!bookmark) {
            throw new NotFoundException(`Bookmark ${id} not found`);
        }
        return bookmark;
    }
}
