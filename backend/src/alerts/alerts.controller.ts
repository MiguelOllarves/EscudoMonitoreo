import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AlertsService } from './alerts.service';
import {
  IngestAlertDto,
  UpdateAlertStatusDto,
} from './dto/alert.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  /** Endpoint de ingesta — recibe alertas del simulador Python */
  @Post('ingest')
  async ingestAlert(@Body() dto: IngestAlertDto) {
    return this.alertsService.ingestAlert(dto);
  }

  /** Listar alertas con filtros */
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query('threatType') threatType?: string,
    @Query('severity') severity?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.alertsService.findAll({
      threatType,
      severity,
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  /** Obtener alerta específica */
  @UseGuards(JwtAuthGuard)
  @Get(':alertId')
  async findOne(@Param('alertId') alertId: string) {
    return this.alertsService.findOne(alertId);
  }

  /** Actualizar estado de alerta */
  @UseGuards(JwtAuthGuard)
  @Patch(':alertId/status')
  async updateStatus(
    @Param('alertId') alertId: string,
    @Body() dto: UpdateAlertStatusDto,
  ) {
    return this.alertsService.updateStatus(alertId, dto);
  }

  /** Estadísticas del dashboard */
  @UseGuards(JwtAuthGuard)
  @Get('dashboard/stats')
  async getDashboardStats() {
    return this.alertsService.getDashboardStats();
  }
}
