import { ValidationPipe } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';

export async function createTestAppForModule(moduleRef: TestingModule) {
    const app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    return app;
}
