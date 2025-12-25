import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for development frontends. Configure via CORS_ORIGINS env (comma-separated),
  // otherwise allow http://localhost:3001 by default.
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim())
    : [
        'http://localhost:3001',
        'https://school-connect-mgmt-frontend.vercel.app',
      ];
  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Validation (class-validator)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('SchoolConnect - Public APIs')
    .setDescription('Public/Onboarding APIs')
    .setVersion('0.1')
    .addBearerAuth()
    .build();
  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api/docs', app, document, {
  //   swaggerOptions: {
  //     persistAuthorization: true,
  //   },
  // });
  const document = SwaggerModule.createDocument(app, config);

  // expose JSON only
  app.getHttpAdapter().get('/swagger-json', (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    res.json(document);
  });

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`Server listening on http://localhost:${port}`);
}
void bootstrap();
