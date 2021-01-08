import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bookmark } from './entities/bookmark.entity';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';

@Injectable()
export class BookmarksService {
    constructor(@InjectRepository(Bookmark) private bookmarkRepository: Repository<Bookmark>) {}

    async getUserBookmarks(userId: string): Promise<Bookmark[]> {
        return this.bookmarkRepository.find({
            where: {
                userId,
            },
        });
    }

    async createBookmark(user: CreateBookmarkDto): Promise<Bookmark> {
        const bookmarkEntity = this.bookmarkRepository.create(user);
        return this.bookmarkRepository.save(bookmarkEntity);
    }
}
