import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { AppConfig } from './enitities/app-config.entity';
import { AppConfigController } from './app-config.controller';
import { AppConfigService } from './app-config.service';
import { S3Module } from '../s3/s3.module';

@Module({
    imports: [TypeOrmModule.forFeature([AppConfig]), forwardRef(() => UsersModule), forwardRef(() => S3Module)],
    controllers: [AppConfigController],
    providers: [AppConfigService],
    exports: [AppConfigService],
})
export class AppConfigModule {}
