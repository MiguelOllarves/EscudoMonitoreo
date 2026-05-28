import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../redis/redis.service';
export declare class AlertsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private redis;
    server: Server;
    private readonly logger;
    private connectedClients;
    constructor(redis: RedisService);
    afterInit(): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
}
