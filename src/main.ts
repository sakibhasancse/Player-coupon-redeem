import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const { PORT = 3001, ENVIRONMENT, ENVIRONMENT_MESSAGE } = process.env;

  await app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`);
    console.log(
      `Running in ${ENVIRONMENT} mode: ${ENVIRONMENT_MESSAGE}`,
    );
  });
}
bootstrap();
