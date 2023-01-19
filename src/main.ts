import * as cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ErrorExceptionFilter, HttpExceptionFilter } from './exception-filter';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    app.enableCors();
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            stopAtFirstError: true,
            exceptionFactory: (errors) => {
                const errorsForResponse = [];

                errors.forEach((e) => {
                    //    errorsForResponse.push({ field: e.property });
                    const constrainsKeys = Object.keys(e.constraints);
                    constrainsKeys.forEach((cKey) => {
                        errorsForResponse.push({
                            message: e.constraints[cKey],
                            field: e.property,
                        });
                    });
                });
                throw new BadRequestException(errorsForResponse);
            },
        }),
    );
    app.useGlobalFilters(new ErrorExceptionFilter(), new HttpExceptionFilter());
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    await app.listen(5000);
}
bootstrap();
