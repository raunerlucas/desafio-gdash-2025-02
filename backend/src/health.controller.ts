import {Controller, Get} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {InjectConnection} from '@nestjs/mongoose';
import {Connection} from 'mongoose';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private connection: Connection) {}

  @Get()
  @ApiOperation({
    summary: 'Health check',
    description: 'Verifica o status da aplicação e suas dependências',
  })
  @ApiResponse({
    status: 200,
    description: 'Sistema operacional',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2025-12-07T10:00:00.000Z' },
        uptime: { type: 'number', example: 3600 },
        database: { type: 'string', example: 'connected' },
      },
    },
  })
  async check() {
    const dbStatus = this.connection.readyState === 1 ? 'connected' : 'disconnected';

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    };
  }

  @Get('liveness')
  @ApiOperation({
    summary: 'Liveness probe',
    description: 'Verifica se a aplicação está viva (para Kubernetes)',
  })
  @ApiResponse({
    status: 200,
    description: 'Aplicação está viva',
  })
  liveness() {
    return { status: 'alive' };
  }

  @Get('readiness')
  @ApiOperation({
    summary: 'Readiness probe',
    description: 'Verifica se a aplicação está pronta para receber requisições',
  })
  @ApiResponse({
    status: 200,
    description: 'Aplicação está pronta',
  })
  @ApiResponse({
    status: 503,
    description: 'Aplicação não está pronta',
  })
  async readiness() {
    const dbReady = this.connection.readyState === 1;

    if (!dbReady) {
      throw new Error('Database not ready');
    }

    return { status: 'ready', database: 'connected' };
  }
}

