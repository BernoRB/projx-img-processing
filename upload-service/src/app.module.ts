import { Module } from '@nestjs/common';
import { UploadsModule } from './uploads/uploads.module';
import { StatusService } from './status/status.service';
import { ConfigModule } from '@nestjs/config';
import { StatusController } from './status/status.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UploadsModule,
  ],
  controllers: [StatusController],
  providers: [StatusService],
})
export class AppModule {}
