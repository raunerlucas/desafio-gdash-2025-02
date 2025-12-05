export interface WeatherData {
  id: string;
  timestamp: Date;
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  pressure?: number;
  visibility?: number;
}

export interface WeatherForecast {
  date: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  rainProbability?: number;
}

export interface AIInsight {
  id: string;
  type: 'alert' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  severity?: 'low' | 'medium' | 'high';
}
