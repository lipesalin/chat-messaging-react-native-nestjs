import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: './.env'
        })
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: 'AUTH_SERVICE',
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                //recuperando váriaveis de auth do RabbitMQ
                const USER = configService.get('RABBITMQ_USER');
                const PASS = configService.get('RABBITMQ_PASS');
                const HOST = configService.get('RABBITMQ_HOST');
                const QUEUE = configService.get('RABBITMQ_AUTH_QUEUE');

                //cria conexão com RabbitMQ
                return ClientProxyFactory.create({
                    transport: Transport.RMQ,
                    options: {
                        urls: [`amqp://${USER}:${PASS}@${HOST}`],
                        noAck: true, // false para que possamos escutar manualmente/específico,
                        queue: QUEUE,
                        queueOptions: {
                            durable: true // faz com que os dados não sejam perdidos perante reinicialização
                        }
                    }
                });
            }
        },
    ],
})
export class AppModule {}
