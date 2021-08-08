import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { BlockedUserGuard } from '../../guards/blocked-user.guard';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';
import { PageEntity } from './entities/page.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PageEntity]), forwardRef(() => UsersModule)],
    controllers: [PagesController],
    providers: [PagesService, BlockedUserGuard],
    exports: [PagesService],
})
export class PagesModule {}
