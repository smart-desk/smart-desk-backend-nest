import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { v4 as uuid } from 'uuid';
import { createRepositoryMock, createTestAppForModule, declareCommonProviders } from '../../../test/test.utils';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { JwtAuthGuardMock } from '../../../test/mocks/jwt-auth.guard.mock';
import { ACGuard } from 'nest-access-control';
import { AcGuardMock } from '../../../test/mocks/ac.guard.mock';
import { ChatModule } from './chat.module';
import { Product } from '../products/entities/product.entity';
import { Field } from '../fields/field.entity';
import { Chat } from './enitities/chat.entity';
import { ChatMessage } from './enitities/chat-message.entity';
import * as io from 'socket.io-client';
import { ChatEvent } from './chat.gateway';
import { WsJwtAuthGuard } from '../../guards/ws-jwt-auth.guard';
import { WsJwtAuthGuardMock } from '../../../test/mocks/ws-jwt-auth.guard.mock';
import { PreferContact } from '../products/models/prefer-contact.enum';
import { FieldType } from '../dynamic-fields/dynamic-fields.module';

describe('Chat gateway', () => {
    let app: INestApplication;
    let socket;
    let baseAddress;
    const user = new User();
    user.id = uuid();

    const field = new Field();
    field.id = uuid();
    field.type = FieldType.INPUT_TEXT;

    const product = new Product();
    product.id = uuid();
    product.userId = user.id;
    product.fields = [field];

    const chat = new Chat();
    chat.id = uuid();
    chat.user1 = user.id;
    chat.user2 = 'FromTestWsJwtAuthGuardMock';
    chat.productId = uuid();

    const chatMessage = new ChatMessage();
    chatMessage.id = uuid();

    const JwtGuard = JwtAuthGuardMock;
    const productServiceRepositoryMock = createRepositoryMock([product]);
    const userServiceRepositoryMock = createRepositoryMock<User>([user]);
    const chatMessageRepositoryMock = createRepositoryMock([chatMessage]);
    const chatRepositoryMock = createRepositoryMock([chat]);

    beforeAll(async () => {
        let moduleBuilder = await Test.createTestingModule({
            imports: [ChatModule],
        });

        const moduleRef = await declareCommonProviders(moduleBuilder)
            .overrideProvider(getRepositoryToken(Chat))
            .useValue(chatRepositoryMock)
            .overrideProvider(getRepositoryToken(ChatMessage))
            .useValue(chatMessageRepositoryMock)
            .overrideProvider(getRepositoryToken(Product))
            .useValue(productServiceRepositoryMock)
            .overrideProvider(getRepositoryToken(Field))
            .useValue(createRepositoryMock([field]))
            .overrideProvider(getRepositoryToken(User))
            .useValue(userServiceRepositoryMock)
            .overrideGuard(ACGuard)
            .useValue(AcGuardMock)
            .overrideGuard(JwtAuthGuard)
            .useValue(JwtGuard)
            .overrideGuard(WsJwtAuthGuard)
            .useValue(WsJwtAuthGuardMock)
            .compile();

        app = await createTestAppForModule(moduleRef);

        const address = app.getHttpServer().listen().address();
        baseAddress = `http://localhost:${address.port}`;
    });

    describe('create chat', () => {
        // todo add test case that NEW_CHAT is triggering for another user
        it(`successfully`, done => {
            socket = io.connect(baseAddress, { path: '/socket' });
            const id = uuid();
            const productId = uuid();
            socket.emit(ChatEvent.CREATE_CHAT, { id, productId });
            socket.on(ChatEvent.CREATE_CHAT, res => {
                expect(res.id).toBe(id);
                expect(res.data.productId).toBe(chat.productId);
                done();
            });
        });

        it(`with error - unauthorized`, done => {
            WsJwtAuthGuardMock.canActivate.mockReturnValueOnce(false);
            socket = io.connect(baseAddress, { path: '/socket' });
            const id = uuid();
            const productId = uuid();
            socket.emit(ChatEvent.CREATE_CHAT, { id, productId });
            socket.on('exception', res => {
                expect(res.message).toBe('Forbidden resource');
                done();
            });
        });

        it(`with error - same user`, done => {
            WsJwtAuthGuardMock.canActivate.mockImplementationOnce(context => {
                context.switchToWs().getData().user = user;
                return true;
            });

            socket = io.connect(baseAddress, { path: '/socket' });
            const id = uuid();
            const productId = uuid();
            socket.emit(ChatEvent.CREATE_CHAT, { id, productId });
            socket.on('exception', res => {
                expect(res.message).toContain("Chat participants can't be the same user");
                done();
            });
        });

        it(`with error - user prefers phone`, done => {
            product.preferContact = PreferContact.PHONE;
            productServiceRepositoryMock.findOne.mockReturnValueOnce(product);

            socket = io.connect(baseAddress, { path: '/socket' });
            const id = uuid();
            const productId = uuid();
            socket.emit(ChatEvent.CREATE_CHAT, { id, productId });
            socket.on('exception', res => {
                expect(res.message).toContain('User prefers phone');
                done();
            });
        });
    });

    describe('init chats', () => {
        it(`successfully`, done => {
            socket = io.connect(baseAddress, { path: '/socket' });
            socket.emit(ChatEvent.INIT_CHATS, {});
            socket.on(ChatEvent.INIT_CHATS, res => {
                expect(res).toBeUndefined();
                done();
            });
        });

        it(`with error - unauthorized`, done => {
            WsJwtAuthGuardMock.canActivate.mockReturnValueOnce(false);
            socket = io.connect(baseAddress, { path: '/socket' });
            socket.emit(ChatEvent.INIT_CHATS, {});
            socket.on('exception', res => {
                expect(res.message).toBe('Forbidden resource');
                done();
            });
        });
    });

    describe('get profile chats', () => {
        it(`successfully`, done => {
            socket = io.connect(baseAddress, { path: '/socket' });
            const id = uuid();
            socket.emit(ChatEvent.GET_CHATS, { id });
            socket.on(ChatEvent.GET_CHATS, res => {
                expect(res.id).toBe(id);
                expect(res.data.length).toBeTruthy();
                done();
            });
        });

        it(`with error - unauthorized`, done => {
            WsJwtAuthGuardMock.canActivate.mockReturnValueOnce(false);
            socket = io.connect(baseAddress, { path: '/socket' });
            const id = uuid();
            socket.emit(ChatEvent.GET_CHATS, { id });
            socket.on('exception', res => {
                expect(res.message).toBe('Forbidden resource');
                done();
            });
        });
    });

    describe('join chat', () => {
        it(`successfully`, done => {
            socket = io.connect(baseAddress, { path: '/socket' });
            const chatId = uuid();
            socket.emit(ChatEvent.JOIN_CHAT, { chatId });
            socket.on(ChatEvent.JOIN_CHAT, res => {
                expect(res.chatId).toBe(chatId);
                done();
            });
        });

        it(`with error not authorized`, done => {
            WsJwtAuthGuardMock.canActivate.mockReturnValueOnce(false);
            socket = io.connect(baseAddress, { path: '/socket' });
            const chatId = uuid();
            socket.emit(ChatEvent.JOIN_CHAT, { chatId });
            socket.on('exception', res => {
                expect(res.message).toBe('Forbidden resource');
                done();
            });
        });

        it(`with error not participant of a chat`, done => {
            chatRepositoryMock.findOne.mockReturnValueOnce({ user1: '1', user2: '2' });
            socket = io.connect(baseAddress, { path: '/socket' });
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
            socket = io.connect(baseAddress, { path: '/socket' });
            const chatId = uuid();
            const content = 'test';
            const message = { chatId, content };
            chatMessageRepositoryMock.save.mockReturnValueOnce(message);

            socket2 = io.connect(baseAddress, { path: '/socket' });

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
            socket = io.connect(baseAddress, { path: '/socket' });
            const chatId = uuid();
            socket.emit(ChatEvent.GET_MESSAGES, { chatId });
            socket.on(ChatEvent.GET_MESSAGES, res => {
                expect(res.length).toBe(1);
                done();
            });
        });

        it(`with error not authorized`, done => {
            WsJwtAuthGuardMock.canActivate.mockReturnValueOnce(false);
            socket = io.connect(baseAddress, { path: '/socket' });
            const chatId = uuid();
            socket.emit(ChatEvent.GET_MESSAGES, { chatId });
            socket.on('exception', res => {
                expect(res.message).toBe('Forbidden resource');
                done();
            });
        });

        it(`with error not participant of a chat`, done => {
            chatRepositoryMock.findOne.mockReturnValueOnce({ user1: '1', user2: '2' });
            socket = io.connect(baseAddress, { path: '/socket' });
            const chatId = uuid();
            socket.emit(ChatEvent.GET_MESSAGES, { chatId });
            socket.on('exception', res => {
                expect(res.message).toBe('Forbidden');
                done();
            });
        });
    });

    describe('read chat', () => {
        it(`successfully`, done => {
            socket = io.connect(baseAddress, { path: '/socket' });
            const chatId = uuid();
            socket.emit(ChatEvent.READ_CHAT, { chatId });
            socket.on(ChatEvent.READ_CHAT, res => {
                expect(res).toBeUndefined();
                done();
            });
        });

        it(`with error not authorized`, done => {
            WsJwtAuthGuardMock.canActivate.mockReturnValueOnce(false);
            socket = io.connect(baseAddress, { path: '/socket' });
            const chatId = uuid();
            socket.emit(ChatEvent.READ_CHAT, { chatId });
            socket.on('exception', res => {
                expect(res.message).toBe('Forbidden resource');
                done();
            });
        });

        it(`with error not participant of a chat`, done => {
            chatRepositoryMock.findOne.mockReturnValueOnce({ user1: '1', user2: '2' });
            socket = io.connect(baseAddress, { path: '/socket' });
            const chatId = uuid();
            socket.emit(ChatEvent.READ_CHAT, { chatId });
            socket.on('exception', res => {
                expect(res.message).toBe('Forbidden');
                done();
            });
        });
    });

    afterEach(() => {
        socket.close();
    });

    afterAll(() => {
        app.close();
    });
});
