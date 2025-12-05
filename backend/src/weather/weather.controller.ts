import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto, WeatherQueryDto } from './dto/weather.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post('logs')
  @UseGuards(JwtAuthGuard)
  create(@Body() createWeatherLogDto: CreateWeatherLogDto) {
    return this.weatherService.create(createWeatherLogDto);
  }

  @Get('logs')
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query: WeatherQueryDto) {
    return this.weatherService.findAll(query);
  }

  @Get('export.csv')
  @UseGuards(JwtAuthGuard)
  async exportCSV(@Res() res: Response) {
    const csvData = await this.weatherService.exportToCSV();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=weather-logs.csv');
    res.send(csvData);
  }

  @Get('export.xlsx')
  @UseGuards(JwtAuthGuard)
  async exportXLSX(@Res() res: Response) {
    const xlsxBuffer = await this.weatherService.exportToXLSX();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=weather-logs.xlsx');
    res.send(xlsxBuffer);
  }

  @Get('insights')
  @UseGuards(JwtAuthGuard)
  async getInsights() {
    return this.weatherService.generateInsights();
  }
}
