import { BadRequestException, Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ACGuard, UseRoles } from 'nest-access-control';
import { ResourceEnum } from '../app/app.roles';
import { Chat } from './enitities/chat.entity';
import { RequestWithUserPayload } from '../auth/jwt.strategy';
import { CreateChatDto } from './dto/create-chat.dto';
import { AdvertsService } from '../adverts/adverts.service';

@Controller('chats')
export class ChatController {
    constructor(private chatService: ChatService, private advertsService: AdvertsService) {}

    @Post()
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.CHAT,
        action: 'create',
    })
    async createChat(@Req() req: RequestWithUserPayload, @Body() body: CreateChatDto): Promise<Chat> {
        const advert = await this.advertsService.getById(body.advertId);
        body.user1 = req.user.id;
        body.user2 = advert.userId;
        if (body.user1 === body.user2) {
            throw new BadRequestException("Chat participants can't be the same user");
        }
        return this.chatService.createChat(body);
    }

    @Get()
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.CHAT,
        action: 'read',
    })
    async getProfileChats(@Req() req: RequestWithUserPayload): Promise<Chat[]> {
        return this.chatService.getChatsByUser(req.user.id);
    }
}
