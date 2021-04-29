import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ACGuard, UseRoles } from 'nest-access-control';
import { S3Service } from './s3.service';
import { UploadImageResponse } from './dto/upload-image-response';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ResourceEnum } from '../app/app.roles';

@Controller('s3')
@ApiTags('S3')
export class S3Controller {
    constructor(private s3Service: S3Service) {}

    @Post('image')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.FILE,
        action: 'create',
    })
    // todo add file validation when this issue will be resolved
    // https://github.com/nestjs/nest/issues/4752
    uploadImage(@UploadedFile() file: Express.Multer.File): Promise<UploadImageResponse> {
        return this.s3Service.uploadTemporaryImage(file.buffer, file.originalname);
    }
}
