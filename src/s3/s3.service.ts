import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
    constructor(private config: ConfigService) {}

    async uploadTemporaryImage(dataBuffer: Buffer, filename: string): Promise<string> {
        const s3 = new S3();
        const uploadResult = await s3
            .upload({
                Bucket: this.config.get('AWS_ADVERT_BUCKET_NAME'),
                Body: dataBuffer,
                Key: `temp/${uuid()}-${filename}`,
            })
            .promise();

        return uploadResult.Location;
    }
}
