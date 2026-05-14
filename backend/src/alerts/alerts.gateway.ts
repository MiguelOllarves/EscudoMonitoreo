import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../redis/redis.service';

const REDIS_CHANNEL = 'cybershield:alerts';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/alerts',
})
export class AlertsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(AlertsGateway.name);
  private connectedClients = 0;

  constructor(private redis: RedisService) {}

  afterInit() {
    this.logger.log('🔌 WebSocket Gateway /alerts inicializado');

    // Suscribirse a Redis y reemitir a todos los clientes WebSocket
    this.redis.subscribe(REDIS_CHANNEL, (message: string) => {
      try {
        const alert = JSON.parse(message);
        this.server.emit('new-alert', alert);
        this.logger.debug(`📡 Alerta emitida a ${this.connectedClients} clientes`);
      } catch (err) {
        this.logger.error('Error parseando alerta de Redis', err);
      }
    });
  }

  handleConnection(client: Socket) {
    this.connectedClients++;
    this.logger.log(
      `✅ Cliente conectado: ${client.id} (Total: ${this.connectedClients})`,
    );
  }

  handleDisconnect(client: Socket) {
    this.connectedClients--;
    this.logger.log(
      `❌ Cliente desconectado: ${client.id} (Total: ${this.connectedClients})`,
    );
  }
}
