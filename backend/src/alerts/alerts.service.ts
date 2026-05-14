import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { IngestAlertDto, UpdateAlertStatusDto } from './dto/alert.dto';
import {
  ThreatType,
  SeverityLevel,
  AlertStatus,
  SensorType,
} from '@prisma/client';

const REDIS_CHANNEL = 'cybershield:alerts';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async ingestAlert(dto: IngestAlertDto) {
    try {
      // 1. Guardar en PostgreSQL
      const alert = await this.prisma.alert.create({
        data: {
          alertId: dto.alert_id,
          threatType: dto.threat_type as ThreatType,
          severity: dto.severity as SeverityLevel,
          status: (dto.status as AlertStatus) || AlertStatus.new,
          sensorType: dto.sensor_type as SensorType,
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

      // 2. Publicar a Redis para el Dashboard
      await this.redis.publish(REDIS_CHANNEL, JSON.stringify(alert));

      this.logger.log(`🔔 Persistida: [${alert.severity}] ${alert.threatType}`);
      return alert;
    } catch (error) {
      this.logger.error('Error persistiendo alerta:', error.message);
      // Fallback: al menos enviarla por Redis si falla la DB
      await this.redis.publish(REDIS_CHANNEL, JSON.stringify(dto));
      return dto;
    }
  }

  async findAll(params: any) {
    const { threatType, severity, status, limit = 50, offset = 0 } = params;
    const where: any = {};
    if (threatType) where.threatType = threatType;
    if (severity) where.severity = severity;
    if (status) where.status = status;

    const [alerts, total] = await Promise.all([
      this.prisma.alert.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.alert.count({ where }),
    ]);

    return { alerts, total, limit, offset };
  }

  async findOne(alertId: string) {
    return this.prisma.alert.findUnique({ where: { alertId } });
  }

  async updateStatus(alertId: string, dto: UpdateAlertStatusDto) {
    return this.prisma.alert.update({
      where: { alertId },
      data: { status: dto.status as AlertStatus },
    });
  }

  async getDashboardStats() {
    try {
      const [totalAlerts, severityCounts, threatCounts] = await Promise.all([
        this.prisma.alert.count(),
        this.prisma.alert.groupBy({
          by: ['severity'],
          _count: { severity: true },
        }),
        this.prisma.alert.groupBy({
          by: ['threatType'],
          _count: { threatType: true },
          orderBy: { _count: { threatType: 'desc' } },
          take: 5,
        }),
      ]);

      const severityMap: any = { low: 0, medium: 0, high: 0, critical: 0 };
      severityCounts.forEach((s) => (severityMap[s.severity] = s._count.severity));

      return {
        totalAlerts,
        severityBreakdown: severityMap,
        topThreats: threatCounts.map((t) => ({ type: t.threatType, count: t._count.threatType })),
        recentAlerts: await this.prisma.alert.findMany({ orderBy: { timestamp: 'desc' }, take: 10 }),
      };
    } catch (e) {
      return { totalAlerts: 0, severityBreakdown: {}, topThreats: [], recentAlerts: [] };
    }
  }
}
