import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { BlockedUserGuard } from '../../guards/blocked-user.guard';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';
import { Pages } from './entities/pages';

@Module({
    imports: [TypeOrmModule.forFeature([Pages]), forwardRef(() => UsersModule)],
    controllers: [PagesController],
    providers: [PagesService, BlockedUserGuard],
    exports: [PagesService],
})
export class AdModule {}
