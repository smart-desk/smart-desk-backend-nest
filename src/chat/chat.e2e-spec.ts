import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { v4 as uuid } from 'uuid';
import { createRepositoryMock, createTestAppForModule, declareDynamicFieldsProviders } from '../../test/test.utils';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtAuthGuardMock } from '../../test/mocks/jwt-auth.guard.mock';
import { ACGuard } from 'nest-access-control';
import { AcGuardMock } from '../../test/mocks/ac.guard.mock';
import { ChatModule } from './chat.module';
import { CreateChatDto } from './dto/create-chat.dto';
import { Advert } from '../adverts/entities/advert.entity';
import { Field } from '../fields/field.entity';
import { Chat } from './enitities/chat.entity';
import { Section } from '../sections/section.entity';
import { ChatMessage } from './enitities/chat-message.entity';

describe('Chat controller', () => {
    let app: INestApplication;
    const user = new User();
    user.id = uuid();

    const advert = new Advert();
    advert.id = uuid();
    advert.sections = [];
    advert.userId = user.id;

    const section = new Section();
    section.id = uuid();
    section.fields = [];

    const field = new Field();
    field.id = uuid();

    const chat = new Chat();
    chat.id = uuid();

    const chatMessage = new ChatMessage();
    chatMessage.id = uuid();

    const JwtGuard = JwtAuthGuardMock;
    const userServiceRepositoryMock = createRepositoryMock<User>([user]);

    beforeAll(async () => {
        let moduleBuilder = await Test.createTestingModule({
            imports: [ChatModule],
        })
            .overrideProvider(getRepositoryToken(Chat))
            .useValue(createRepositoryMock([chat]))
            .overrideProvider(getRepositoryToken(ChatMessage))
            .useValue(createRepositoryMock([chatMessage]))
            .overrideProvider(getRepositoryToken(Advert))
            .useValue(createRepositoryMock([advert]))
            .overrideProvider(getRepositoryToken(Section))
            .useValue(createRepositoryMock([section]))
            .overrideProvider(getRepositoryToken(Field))
            .useValue(createRepositoryMock([field]))
            .overrideProvider(getRepositoryToken(User))
            .useValue(userServiceRepositoryMock)
            .overrideGuard(ACGuard)
            .useValue(AcGuardMock)
            .overrideGuard(JwtAuthGuard)
            .useValue(JwtGuard);

        moduleBuilder = declareDynamicFieldsProviders(moduleBuilder);

        const moduleRef = await moduleBuilder.compile();
        app = await createTestAppForModule(moduleRef);
    });

    describe('create chat', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer())
                .post('/chats')
                .send({
                    advertId: uuid(),
                } as CreateChatDto)
                .expect(HttpStatus.CREATED);
        });

        it(`with error - unauthorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).post('/chats').expect(HttpStatus.FORBIDDEN);
        });

        it(`with error - same user`, () => {
            JwtGuard.canActivate.mockImplementationOnce(context => {
                const req = context.switchToHttp().getRequest();
                req.user = user;
                return true;
            });
            return request(app.getHttpServer())
                .post('/chats')
                .send({
                    advertId: uuid(),
                } as CreateChatDto)
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain("Chat participants can't be the same user");
                });
        });
    });

    describe('get profile chats', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer()).get('/chats').expect(HttpStatus.OK);
        });

        it(`with error - unauthorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);
            return request(app.getHttpServer()).get('/chats').expect(HttpStatus.FORBIDDEN);
        });
    });
});
