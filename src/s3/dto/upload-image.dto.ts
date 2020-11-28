import { ApiProperty } from '@nestjs/swagger';

export class UploadImageDto {
    @ApiProperty({
        description: 'Image',
        type: 'file',
        items: {
            type: 'string',
            format: 'binary',
        },
    })
    file: string;
}
