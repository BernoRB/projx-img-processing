import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
  controllers: [AppController, StatusController],
  providers: [AppService, StatusService],
})
export class AppModule {}
