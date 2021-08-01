import { Module } from '@nestjs/common';
import { PhotoService } from './photo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotoEntity } from './photo.entity';
import { S3Module } from '../../s3/s3.module';

@Module({
    imports: [TypeOrmModule.forFeature([PhotoEntity]), S3Module],
    providers: [PhotoService],
    exports: [PhotoService],
})
export class PhotoModule {}
