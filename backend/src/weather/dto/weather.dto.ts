import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateWeatherLogDto {
  @IsString()
  location: string;

  @IsNumber()
  temperature: number;

  @IsNumber()
  humidity: number;

  @IsNumber()
  pressure: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  windSpeed?: number;

  @IsOptional()
  @IsString()
  windDirection?: string;

  @IsOptional()
  @IsNumber()
  visibility?: number;

  @IsOptional()
  @IsNumber()
  uvIndex?: number;

  @IsOptional()
  @IsString()
  source?: string;
}

export class WeatherQueryDto {
  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number = 20;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class WeatherInsightDto {
  averageTemperature: number;
  maxTemperature: number;
  minTemperature: number;
  averageHumidity: number;
  averagePressure: number;
  totalRecords: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  temperatureTrend: 'rising' | 'falling' | 'stable';
  recommendations: string[];
}
