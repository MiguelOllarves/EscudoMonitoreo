import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class RedisService implements OnModuleDestroy {
    private config;
    private readonly publisher;
    private readonly subscriber;
    constructor(config: ConfigService);
    publish(channel: string, message: string): Promise<void>;
    subscribe(channel: string, callback: (message: string) => void): Promise<void>;
    onModuleDestroy(): void;
}
