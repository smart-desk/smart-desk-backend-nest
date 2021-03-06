import { BadRequestException, Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ACGuard } from 'nest-access-control';
import { PhoneService } from './phone.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { BlockedUserGuard } from '../guards/blocked-user.guard';
import { RequestWithUserPayload } from '../auth/jwt.strategy';
import { UsersService } from '../users/users.service';
import { PhoneVerifyCheckDto } from './dto/phone-verify-check.dto';

@Controller('phone')
@ApiTags('Phone')
export class PhoneController {
    constructor(private phoneService: PhoneService, private usersService: UsersService) {}

    @Post('verify/request')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    async verifyRequest(@Req() req: RequestWithUserPayload): Promise<string> {
        const user = await this.usersService.findOneOrThrowException(req.user.id);
        if (!user.phone) {
            throw new BadRequestException(`User ${req.user.id} has no phone number`);
        }
        if (user.isPhoneVerified) {
            throw new BadRequestException(`User ${req.user.id} has already verified phone number`);
        }
        return await this.phoneService.verifyRequest(user.phone);
    }

    @Post('verify/check')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    async verifyCheck(@Req() req: RequestWithUserPayload, @Body() body: PhoneVerifyCheckDto): Promise<string> {
        const user = await this.usersService.findOneOrThrowException(req.user.id);
        if (!user.phone) {
            throw new BadRequestException(`User ${req.user.id} has no phone number`);
        }
        if (user.isPhoneVerified) {
            throw new BadRequestException(`User ${req.user.id} has already verified phone number`);
        }

        const result = await this.phoneService.verifyCheck(body);
        await this.usersService.updateUser(user.id, { isPhoneVerified: true });
        return result;
    }
}
