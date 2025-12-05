import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as XLSX from 'xlsx';
import { WeatherLog, WeatherLogDocument } from './weather-log.schema';
import { CreateWeatherLogDto, WeatherQueryDto, WeatherInsightDto } from './dto/weather.dto';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(WeatherLog.name) private weatherLogModel: Model<WeatherLogDocument>,
  ) {}

  async create(createWeatherLogDto: CreateWeatherLogDto): Promise<WeatherLog> {
    const createdLog = new this.weatherLogModel(createWeatherLogDto);
    return createdLog.save();
  }

  async findAll(query: WeatherQueryDto): Promise<{
    data: WeatherLog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, location, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.weatherLogModel.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.weatherLogModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async exportToCSV(): Promise<string> {
    const data = await this.weatherLogModel.find().sort({ timestamp: -1 }).exec();

    const csvData = data.map(log => ({
      Location: log.location,
      Temperature: log.temperature,
      Humidity: log.humidity,
      Pressure: log.pressure,
      Description: log.description || '',
      'Wind Speed': log.windSpeed || '',
      'Wind Direction': log.windDirection || '',
      Visibility: log.visibility || '',
      'UV Index': log.uvIndex || '',
      Timestamp: log.timestamp.toISOString(),
      Source: log.source || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(csvData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Weather Logs');

    return XLSX.utils.sheet_to_csv(worksheet);
  }

  async exportToXLSX(): Promise<Buffer> {
    const data = await this.weatherLogModel.find().sort({ timestamp: -1 }).exec();

    const xlsxData = data.map(log => ({
      Location: log.location,
      Temperature: log.temperature,
      Humidity: log.humidity,
      Pressure: log.pressure,
      Description: log.description || '',
      'Wind Speed': log.windSpeed || '',
      'Wind Direction': log.windDirection || '',
      Visibility: log.visibility || '',
      'UV Index': log.uvIndex || '',
      Timestamp: log.timestamp.toISOString(),
      Source: log.source || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(xlsxData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Weather Logs');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async generateInsights(): Promise<WeatherInsightDto> {
    const logs = await this.weatherLogModel.find().sort({ timestamp: -1 }).exec();

    if (logs.length === 0) {
      return {
        averageTemperature: 0,
        maxTemperature: 0,
        minTemperature: 0,
        averageHumidity: 0,
        averagePressure: 0,
        totalRecords: 0,
        dateRange: { start: new Date(), end: new Date() },
        temperatureTrend: 'stable',
        recommendations: ['Não há dados suficientes para análise'],
      };
    }

    const temperatures = logs.map(log => log.temperature);
    const humidities = logs.map(log => log.humidity);
    const pressures = logs.map(log => log.pressure);

    const avgTemp = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    const maxTemp = Math.max(...temperatures);
    const minTemp = Math.min(...temperatures);
    const avgHumidity = humidities.reduce((a, b) => a + b, 0) / humidities.length;
    const avgPressure = pressures.reduce((a, b) => a + b, 0) / pressures.length;

    // Análise de tendência de temperatura (últimos 10 registros vs. 10 anteriores)
    let temperatureTrend: 'rising' | 'falling' | 'stable' = 'stable';
    if (logs.length >= 20) {
      const recent = logs.slice(0, 10).map(log => log.temperature);
      const previous = logs.slice(10, 20).map(log => log.temperature);
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length;

      const diff = recentAvg - previousAvg;
      if (diff > 2) temperatureTrend = 'rising';
      else if (diff < -2) temperatureTrend = 'falling';
    }

    // Gerar recomendações baseadas nos dados
    const recommendations: string[] = [];

    if (avgTemp > 30) {
      recommendations.push('Temperaturas altas detectadas. Recomenda-se hidratação adequada.');
    }
    if (avgTemp < 10) {
      recommendations.push('Temperaturas baixas detectadas. Recomenda-se agasalhos adequados.');
    }
    if (avgHumidity > 80) {
      recommendations.push('Umidade alta detectada. Possível desconforto térmico.');
    }
    if (avgHumidity < 30) {
      recommendations.push('Umidade baixa detectada. Recomenda-se hidratação e umidificação.');
    }
    if (temperatureTrend === 'rising') {
      recommendations.push('Tendência de aquecimento detectada nos últimos registros.');
    }
    if (temperatureTrend === 'falling') {
      recommendations.push('Tendência de resfriamento detectada nos últimos registros.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Condições climáticas dentro dos parâmetros normais.');
    }

    return {
      averageTemperature: Math.round(avgTemp * 100) / 100,
      maxTemperature: maxTemp,
      minTemperature: minTemp,
      averageHumidity: Math.round(avgHumidity * 100) / 100,
      averagePressure: Math.round(avgPressure * 100) / 100,
      totalRecords: logs.length,
      dateRange: {
        start: logs[logs.length - 1].timestamp,
        end: logs[0].timestamp,
      },
      temperatureTrend,
      recommendations,
    };
  }
}
