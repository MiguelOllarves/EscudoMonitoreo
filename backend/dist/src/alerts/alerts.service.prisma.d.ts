import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { IngestAlertDto } from './dto/alert.dto';
export declare class AlertsService {
    private prisma;
    private redis;
    private readonly logger;
    constructor(prisma: PrismaService, redis: RedisService);
    ingestAlert(dto: IngestAlertDto): Promise<any>;
}
