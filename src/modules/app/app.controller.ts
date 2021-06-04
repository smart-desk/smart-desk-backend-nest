import { Body, Controller, ForbiddenException, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ACGuard, UseRoles } from 'nest-access-control';
import { ResourceEnum, RolesEnum } from './app.roles';
import { AppService } from './app.service';
import { AppConfigDto } from './dto/app-config.dto';
import { AppConfig } from './enitities/app-config.entity';
import { User } from '../users/entities/user.entity';
import { RequestWithUserPayload } from '../auth/jwt.strategy';

@Controller('app')
@ApiTags('App')
export class AppController {
    constructor(private appService: AppService) {}

    @Post('config')
    @UseGuards(JwtAuthGuard, ACGuard)
    @ApiBearerAuth('access-token')
    @UseRoles({
        resource: ResourceEnum.APP_CONFIG,
        action: 'update',
    })
    updateAppConfig(@Body() body: AppConfigDto, @Req() req: RequestWithUserPayload): Promise<AppConfig> {
        if (!this.isAdmin(req.user)) throw new ForbiddenException();
        return this.appService.updateAppConfig(body);
    }

    @Get('config')
    getAppConfig(): Promise<AppConfig> {
        return this.appService.getAppConfig();
    }

    private isAdmin(user: User): boolean {
        return user.roles && user.roles.some(role => role === RolesEnum.ADMIN);
    }
}
