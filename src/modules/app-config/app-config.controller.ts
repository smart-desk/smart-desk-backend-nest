import { Body, Controller, ForbiddenException, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ACGuard, UseRoles } from 'nest-access-control';
import { ResourceEnum, RolesEnum } from '../app/app.roles';
import { RequestWithUserPayload } from '../auth/jwt.strategy';
import { User } from '../users/entities/user.entity';
import { AppConfigService } from './app-config.service';
import { AppConfig } from './enitities/app-config.entity';
import { AppConfigDto } from './dto/app-config.dto';

@Controller('app-config')
@ApiTags('App Config')
export class AppConfigController {
    constructor(private appService: AppConfigService) {}

    @Post()
    @UseGuards(JwtAuthGuard, ACGuard)
    @ApiBearerAuth('access-token')
    @UseRoles({
        resource: ResourceEnum.APP_CONFIG,
        action: 'update',
    })
    @HttpCode(HttpStatus.OK)
    updateAdConfig(@Body() body: AppConfigDto, @Req() req: RequestWithUserPayload): Promise<AppConfig> {
        if (!this.isAdmin(req.user)) throw new ForbiddenException();
        return this.appService.updateAppConfig(body);
    }

    @Get()
    getAdConfig(): Promise<AppConfig> {
        return this.appService.getAppConfig();
    }

    private isAdmin(user: User): boolean {
        return user.roles && user.roles.some(role => role === RolesEnum.ADMIN);
    }
}
