import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            // May have impact on performance
            transform: true,
        })
    );
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: 'http://localhost:4200',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Accept',
        credentials: true,
    });

    const swaggerOptions = new DocumentBuilder().setTitle('Smart Desk').setDescription('Smart Desk REST API').setVersion('1.0').build();

    const document = SwaggerModule.createDocument(app, swaggerOptions);
    SwaggerModule.setup('swag', app, document);

    await app.listen(3001);
}

bootstrap();
