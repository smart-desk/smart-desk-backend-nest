import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { v4 as uuid } from 'uuid';
import { AccessControlModule } from 'nest-access-control';
import { createRepositoryMock, createTestAppForModule } from '../../test/test.utils';
import { JwtAuthGuardMock } from '../../test/mocks/jwt-auth.guard.mock';
import { roles } from '../app/app.roles';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { AddressModule } from './address.module';
import { Address } from './entities/address.entity';

describe('Address controller', () => {
    let app: INestApplication;

    const userRepositoryMock = createRepositoryMock<User>([new User()]);
    const addressRepositoryMock = createRepositoryMock<Address>([new Address()]);
    const JwtGuard = JwtAuthGuardMock;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AddressModule, TypeOrmModule.forRoot(), AccessControlModule.forRoles(roles)],
        })
            .overrideProvider(getRepositoryToken(Address))
            .useValue(addressRepositoryMock)
            .overrideProvider(getRepositoryToken(User))
            .useValue(userRepositoryMock)
            .overrideGuard(JwtAuthGuard)
            .useValue(JwtGuard)
            .compile();

        app = await createTestAppForModule(moduleRef);
    });

    describe('create address', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer())
                .put('/address')
                .send({
                    radius: 5,
                    title: 'title',
                    lat: 123,
                    lng: 123,
                } as CreateAddressDto)
                .expect(HttpStatus.OK);
        });

        it(`with validation errors`, () => {
            return request(app.getHttpServer())
                .put('/address')
                .send({
                    radius: '2343',
                    title: null,
                    lat: '123',
                    lng: '123',
                })
                .expect(HttpStatus.BAD_REQUEST)
                .expect(res => {
                    expect(res.body.message).toContain('title should not be empty');
                    expect(res.body.message).toContain('title must be shorter than or equal to 255 characters');
                    expect(res.body.message).toContain('title must be a string');
                    expect(res.body.message).toContain('radius must be an integer number');
                    expect(res.body.message).toContain('radius must be a positive number');
                    expect(res.body.message).toContain('radius must be a number conforming to the specified constraints');
                    expect(res.body.message).toContain('lat must be a number conforming to the specified constraints');
                    expect(res.body.message).toContain('lng must be a number conforming to the specified constraints');
                });
        });

        it(`with error - unauthorized`, () => {
            JwtGuard.canActivate.mockReturnValueOnce(false);

            return request(app.getHttpServer())
                .put('/address')
                .send({
                    radius: 5,
                    title: 'title',
                    lat: 123,
                    lng: 123,
                } as CreateAddressDto)
                .expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('update address', () => {
        it(`successfully`, () => {
            return request(app.getHttpServer())
                .put('/address')
                .send({
                    id: uuid(),
                    radius: 5,
                    title: 'title',
                    lat: 123,
                    lng: 123,
                } as CreateAddressDto)
                .expect(HttpStatus.OK);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
