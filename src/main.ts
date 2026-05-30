import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { TransformInterceptor } from './common/interceptors/transform.interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet())

  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  )

  app.useGlobalInterceptors(new TransformInterceptor)

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
