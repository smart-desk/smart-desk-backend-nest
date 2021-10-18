import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PhoneService } from './phone.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { BlockedUserGuard } from '../../guards/blocked-user.guard';
import { RequestWithUserPayload } from '../auth/jwt.strategy';
import { UsersService } from '../users/users.service';
import { PhoneVerifyCheckDto } from './dto/phone-verify-check.dto';

@Controller('phone')
@ApiTags('Phone')
export class PhoneController {
    constructor(private phoneService: PhoneService, private usersService: UsersService) {}

    @Post('verify/request')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, BlockedUserGuard)
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
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, BlockedUserGuard)
    async verifyCheck(@Req() req: RequestWithUserPayload, @Body() body: PhoneVerifyCheckDto): Promise<string> {
        const user = await this.usersService.findOneOrThrowException(req.user.id);
        if (!user.phone) {
            throw new BadRequestException(`User ${req.user.id} has no phone number`);
        }
        if (user.isPhoneVerified) {
            throw new BadRequestException(`User ${req.user.id} has already verified phone number`);
        }

        const result = await this.phoneService.verifyCheck(body);
        // https://help.nexmo.com/hc/en-us/articles/360025561931-What-do-the-Verify-API-response-codes-mean-
        if (result !== '0') {
            switch (result) {
                case '16':
                    throw new BadRequestException(`Code is not correct`);
                default:
                    throw new BadRequestException(`Code error is ${result}`);
            }
        }

        await this.usersService.updateUser(user.id, { isPhoneVerified: true });
        return result;
    }
}
