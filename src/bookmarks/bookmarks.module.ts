import { Module } from '@nestjs/common';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bookmark } from './entities/bookmark.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Bookmark])],
    controllers: [BookmarksController],
    providers: [BookmarksService],
})
export class BookmarksModule {}
