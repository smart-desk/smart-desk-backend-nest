import { Module } from '@nestjs/common';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bookmark } from './entities/bookmark.entity';
import { AdvertsModule } from '../adverts/adverts.module';

@Module({
    imports: [TypeOrmModule.forFeature([Bookmark]), AdvertsModule],
    controllers: [BookmarksController],
    providers: [BookmarksService],
})
export class BookmarksModule {}
