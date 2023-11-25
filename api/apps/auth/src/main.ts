import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
    const app = await NestFactory.create(AuthModule);
    const configService = app.get(ConfigService);

    //recuperando váriaveis de auth do RabbitMQ
    const USER = configService.get('RABBITMQ_USER');
    const PASS = configService.get('RABBITMQ_PASS');
    const HOST = configService.get('RABBITMQ_HOST');
    const QUEUE = configService.get('RABBITMQ_AUTH_QUEUE');

    //gerando conexão com RabbitMQ
    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.RMQ, // tipo de conexão (Rabbit, Kafka...)
        options: {
            urls: [`amqp://${USER}:${PASS}@${HOST}`],
            noAck: false, // false para que possamos escutar manualmente/específico,
            queue: QUEUE,
            queueOptions: {
                durable: true // faz com que os dados não sejam perdidos perante reinicialização
            }
        }
    });

    app.startAllMicroservices();
}
bootstrap();
