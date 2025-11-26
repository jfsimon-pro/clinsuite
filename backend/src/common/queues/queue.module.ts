import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: configService.get('redis.url'),
        settings: {
          stalledInterval: 5000, // Check for stalled jobs every 5 seconds
          maxStalledCount: 2, // Remove job if it gets stalled more than twice
          lockDuration: 30000, // 30 seconds
          lockRenewTime: 15000, // Renew lock every 15 seconds
        },
      }),
    }),
    BullModule.registerQueue(
      { name: 'task-automation' },
      { name: 'whatsapp-sync' },
      { name: 'notifications' },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
