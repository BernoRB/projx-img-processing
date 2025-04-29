import { Controller, Get, Param } from '@nestjs/common';
import { StatusService } from './status.service';

@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get(':id')
  async getImageStatus(@Param('id') id: string) {
    return this.statusService.getImageStatus(id);
  }
}
