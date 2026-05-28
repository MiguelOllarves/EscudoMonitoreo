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
        const alert = await this.prisma.alert.create({
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
};
exports.AlertsService = AlertsService;
exports.AlertsService = AlertsService = AlertsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], AlertsService);
//# sourceMappingURL=alerts.service.prisma.js.map