/**
 * alerts.service.prisma.ts — Versión con PostgreSQL (usar cuando DB esté configurada)
 * 
 * Instrucciones para activar:
 * 1. Configura DATABASE_URL en .env
 * 2. Ejecuta: npx prisma db push && npx prisma generate
 * 3. Renombra este archivo a alerts.service.ts
 * 4. Descomenta PrismaModule en app.module.ts
 * 5. Restaura prisma.service.ts con PrismaClient real
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { IngestAlertDto, UpdateAlertStatusDto } from './dto/alert.dto';

const REDIS_CHANNEL = 'cybershield:alerts';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async ingestAlert(dto: IngestAlertDto) {
    const alert = await (this.prisma as any).alert.create({
      data: {
        alertId: dto.alert_id,
        threatType: dto.threat_type,
        severity: dto.severity,
        status: dto.status || 'new',
        sensorType: dto.sensor_type,
        sensorId: dto.sensor_id,
        sourceIp: dto.source_ip,
        destinationIp: dto.destination_ip,
        sourcePort: dto.source_port ?? null,
        destinationPort: dto.destination_port ?? null,
        protocol: dto.protocol || 'TCP',
        title: dto.title,
        description: dto.description,
        rawLog: dto.raw_log ?? null,
        affectedAsset: dto.affected_asset ?? null,
        mitreTactic: dto.mitre_tactic ?? null,
        mitreTechnique: dto.mitre_technique ?? null,
        confidenceScore: dto.confidence_score ?? 0,
        timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
      },
    });

    await this.redis.publish(REDIS_CHANNEL, JSON.stringify(alert));
    this.logger.log(`🔔 [${alert.severity}] ${alert.threatType} — ${alert.title}`);
    return alert;
  }

  // ... (el resto de métodos quedan igual que en la versión original con Prisma queries)
}
