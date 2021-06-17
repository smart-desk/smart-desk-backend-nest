import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './modules/app/app.module';
import { config as awsConfig } from 'aws-sdk';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bodyParser: false });

    app.useGlobalPipes(
        new ValidationPipe({
            forbidNonWhitelisted: true,
        })
    );
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    app.setGlobalPrefix('api');

    // todo remove on prod!!!
    app.enableCors({
        origin: 'http://localhost:4200',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Accept',
        credentials: true,
    });

    const swaggerOptions = new DocumentBuilder()
        .setTitle('Smart Desk')
        .setDescription('Smart Desk REST API')
        .setVersion('1.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
        .build();
    const document = SwaggerModule.createDocument(app, swaggerOptions);
    SwaggerModule.setup('swag', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });

    awsConfig.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
    });

    await app.listen(3001);
}

bootstrap();
