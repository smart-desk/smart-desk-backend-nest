import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { UploadImageResponse } from './dto/upload-image-response';

@Injectable()
export class S3Service {
    constructor(private config: ConfigService) {}

    async uploadTemporaryImage(dataBuffer: Buffer, filename: string): Promise<UploadImageResponse> {
        const s3 = new S3();
        const uploadResult = await s3
            .upload({
                Bucket: this.config.get('AWS_ADVERT_BUCKET_NAME'),
                Body: dataBuffer,
                Key: `temp/${uuid()}-${filename}`,
            })
            .promise();

        const response = new UploadImageResponse();
        response.key = uploadResult.Key;
        response.url = uploadResult.Location;
        return response;
    }
}
