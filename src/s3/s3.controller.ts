import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UploadImageDto } from './dto/upload-image.dto';
import { S3Service } from './s3.service';
import { UploadImageResponse } from './dto/upload-image-response';

@Controller('s3')
@ApiTags('S3')
export class S3Controller {
    constructor(private s3Service: S3Service) {}

    @Post('image')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    uploadImage(@Body() payload: UploadImageDto, @UploadedFile() file: Express.Multer.File): Promise<UploadImageResponse> {
        return this.s3Service.uploadTemporaryImage(file.buffer, file.originalname);
    }
}
