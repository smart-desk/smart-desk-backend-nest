import { Module } from '@nestjs/common';
import { PhotoService } from './photo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotoEntity } from './photo.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PhotoEntity])],
    providers: [PhotoService],
    exports: [PhotoService],
})
export class PhotoModule {}
