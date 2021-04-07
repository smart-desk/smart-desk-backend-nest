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
import * as io from 'socket.io-client';
import { ChatEvent } from './chat.gateway';
import { WsJwtAuthGuard } from '../guards/ws-jwt-auth.guard';
import { WsJwtAuthGuardMock } from '../../test/mocks/ws-jwt-auth.guard.mock';

describe('Chat controller', () => {
    let app: INestApplication;
    let socket;
    let baseAddress;
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
    chat.user1 = user.id;
    chat.user2 = 'FromTestWsJwtAuthGuardMock';

    const chatMessage = new ChatMessage();
    chatMessage.id = uuid();

    const JwtGuard = JwtAuthGuardMock;
    const userServiceRepositoryMock = createRepositoryMock<User>([user]);
    const chatMessageRepositoryMock = createRepositoryMock([chatMessage]);
    const chatRepositoryMock = createRepositoryMock([chat]);

    beforeAll(async () => {
        let moduleBuilder = await Test.createTestingModule({
            imports: [ChatModule],
        })
            .overrideProvider(getRepositoryToken(Chat))
            .useValue(chatRepositoryMock)
            .overrideProvider(getRepositoryToken(ChatMessage))
            .useValue(chatMessageRepositoryMock)
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
            .useValue(JwtGuard)
            .overrideGuard(WsJwtAuthGuard)
            .useValue(WsJwtAuthGuardMock);

        moduleBuilder = declareDynamicFieldsProviders(moduleBuilder);

        const moduleRef = await moduleBuilder.compile();
        app = await createTestAppForModule(moduleRef);

        const address = app.getHttpServer().listen().address();
        baseAddress = `http://localhost:${address.port}`;
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

    describe('chat gateway', () => {
        describe('join chat', () => {
            it(`successfully`, done => {
                socket = io.connect(baseAddress);
                const chatId = uuid();
                socket.emit(ChatEvent.JOIN_CHAT, { chatId });
                socket.on(ChatEvent.JOIN_CHAT, res => {
                    expect(res.chatId).toBe(chatId);
                    done();
                });
            });

            it(`with error not authorized`, done => {
                WsJwtAuthGuardMock.canActivate.mockReturnValueOnce(false);
                socket = io.connect(baseAddress);
                const chatId = uuid();
                socket.emit(ChatEvent.JOIN_CHAT, { chatId });
                socket.on('exception', res => {
                    expect(res.message).toBe('Forbidden resource');
                    done();
                });
            });

            it(`with error not participant of a chat`, done => {
                chatRepositoryMock.findOne.mockReturnValueOnce({ user1: '1', user2: '2' });
                socket = io.connect(baseAddress);
                const chatId = uuid();
                socket.emit(ChatEvent.JOIN_CHAT, { chatId });
                socket.on('exception', res => {
                    expect(res.message).toBe('Forbidden');
                    done();
                });
            });
        });

        describe('send message', () => {
            let socket2;

            it(`successfully`, done => {
                socket = io.connect(baseAddress);
                const chatId = uuid();
                const content = 'test';
                const message = { chatId, content };
                chatMessageRepositoryMock.save.mockReturnValueOnce(message);

                socket2 = io.connect(baseAddress);

                socket.emit(ChatEvent.JOIN_CHAT, { chatId });
                socket2.emit(ChatEvent.JOIN_CHAT, { chatId });

                socket.emit(ChatEvent.NEW_MESSAGE, message);
                socket2.on(ChatEvent.NEW_MESSAGE, res => {
                    expect(res.content).toBe(content);
                    done();
                });
            });

            afterEach(() => {
                socket2.close();
            });
        });

        describe('get all messages for chat', () => {
            it(`successfully`, done => {
                socket = io.connect(baseAddress);
                const chatId = uuid();
                socket.emit(ChatEvent.GET_MESSAGES, { chatId });
                socket.on(ChatEvent.GET_MESSAGES, res => {
                    expect(res.length).toBe(1);
                    done();
                });
            });

            it(`with error not authorized`, done => {
                WsJwtAuthGuardMock.canActivate.mockReturnValueOnce(false);
                socket = io.connect(baseAddress);
                const chatId = uuid();
                socket.emit(ChatEvent.GET_MESSAGES, { chatId });
                socket.on('exception', res => {
                    expect(res.message).toBe('Forbidden resource');
                    done();
                });
            });

            it(`with error not participant of a chat`, done => {
                chatRepositoryMock.findOne.mockReturnValueOnce({ user1: '1', user2: '2' });
                socket = io.connect(baseAddress);
                const chatId = uuid();
                socket.emit(ChatEvent.GET_MESSAGES, { chatId });
                socket.on('exception', res => {
                    expect(res.message).toBe('Forbidden');
                    done();
                });
            });
        });

        describe('leave chat', () => {
            it(`successfully`, done => {
                socket = io.connect(baseAddress);
                const chatId = uuid();
                socket.emit(ChatEvent.LEAVE_CHAT, { chatId });
                socket.on(ChatEvent.LEAVE_CHAT, res => {
                    expect(res.chatId).toBe(chatId);
                    done();
                });
            });
        });

        afterEach(() => {
            socket.close();
        });
    });

    afterAll(() => {
        app.close();
    });
});
