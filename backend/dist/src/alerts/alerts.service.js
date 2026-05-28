"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AlertsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const client_1 = require("@prisma/client");
const REDIS_CHANNEL = 'cybershield:alerts';
let AlertsService = AlertsService_1 = class AlertsService {
    prisma;
    redis;
    logger = new common_1.Logger(AlertsService_1.name);
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async ingestAlert(dto) {
        try {
            const alert = await this.prisma.alert.create({
                data: {
                    alertId: dto.alert_id,
                    threatType: dto.threat_type,
                    severity: dto.severity,
                    status: dto.status || client_1.AlertStatus.new,
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
            this.logger.log(`🔔 Persistida: [${alert.severity}] ${alert.threatType}`);
            return alert;
        }
        catch (error) {
            this.logger.error('Error persistiendo alerta:', error.message);
            await this.redis.publish(REDIS_CHANNEL, JSON.stringify(dto));
            return dto;
        }
    }
    async findAll(params) {
        const { threatType, severity, status, limit = 50, offset = 0 } = params;
        const where = {};
        if (threatType)
            where.threatType = threatType;
        if (severity)
            where.severity = severity;
        if (status)
            where.status = status;
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
    async findOne(alertId) {
        return this.prisma.alert.findUnique({ where: { alertId } });
    }
    async updateStatus(alertId, dto) {
        return this.prisma.alert.update({
            where: { alertId },
            data: { status: dto.status },
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
            const severityMap = { low: 0, medium: 0, high: 0, critical: 0 };
            severityCounts.forEach((s) => (severityMap[s.severity] = s._count.severity));
            return {
                totalAlerts,
                severityBreakdown: severityMap,
                topThreats: threatCounts.map((t) => ({ type: t.threatType, count: t._count.threatType })),
                recentAlerts: await this.prisma.alert.findMany({ orderBy: { timestamp: 'desc' }, take: 10 }),
            };
        }
        catch (e) {
            return { totalAlerts: 0, severityBreakdown: {}, topThreats: [], recentAlerts: [] };
        }
    }
};
exports.AlertsService = AlertsService;
exports.AlertsService = AlertsService = AlertsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], AlertsService);
//# sourceMappingURL=alerts.service.js.map