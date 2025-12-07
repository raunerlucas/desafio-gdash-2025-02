export interface WeatherData {
  _id: string;
  location: string;
  temperature: number;
  humidity: number;
  pressure: number;
  description?: string;
  windSpeed?: number;
  windDirection?: string;
  visibility?: number;
  uvIndex?: number;
  timestamp: string;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WeatherLogsResponse {
  data: WeatherData[];
  total: number;
  page: number;
  totalPages: number;
}

export interface WeatherInsightData {
  averageTemperature: number;
  maxTemperature: number;
  minTemperature: number;
  averageHumidity: number;
  averagePressure: number;
  totalRecords: number;
  dateRange: {
    start: string;
    end: string;
  };
  temperatureTrend: 'rising' | 'falling' | 'stable';
  recommendations: string[];
}

export interface AIInsight {
  id: string;
  type: 'alert' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}

export interface ChartDataPoint {
  time: string;
  temperature: number;
  humidity: number;
  windSpeed?: number;
  pressure?: number;
}
