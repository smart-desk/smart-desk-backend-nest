import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { UploadImageResponse } from './dto/upload-image-response';

@Injectable()
export class S3Service {
    private s3: S3;

    constructor(private config: ConfigService) {
        this.s3 = new S3();
    }

    async uploadTemporaryImage(dataBuffer: Buffer, filename: string): Promise<UploadImageResponse> {
        const uploadResult = await this.s3
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

    async moveImageToPublic(key: string): Promise<void> {
        const bucketName = this.config.get('AWS_ADVERT_BUCKET_NAME');

        await this.s3
            .copyObject({
                Bucket: bucketName,
                CopySource: bucketName + '/' + key,
                Key: key.replace('temp', 'public'),
            })
            .promise();

        await this.s3
            .deleteObject({
                Bucket: bucketName,
                Key: key,
            })
            .promise();
    }
}
