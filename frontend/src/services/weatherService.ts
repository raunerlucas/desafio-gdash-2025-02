import { api } from './api';
import { WeatherData, WeatherForecast, AIInsight } from '@/types/weather';

export const weatherService = {
  // Get current weather data
  async getCurrentWeather(): Promise<WeatherData> {
    const response = await api.get('/weather/current');
    return response.data;
  },

  // Get weather history
  async getWeatherHistory(limit?: number): Promise<WeatherData[]> {
    const response = await api.get('/weather/history', {
      params: { limit }
    });
    return response.data;
  },

  // Get weather forecast
  async getWeatherForecast(days?: number): Promise<WeatherForecast[]> {
    const response = await api.get('/weather/forecast', {
      params: { days }
    });
    return response.data;
  },

  // Get AI insights
  async getAIInsights(): Promise<AIInsight[]> {
    const response = await api.get('/weather/insights');
    return response.data;
  },

  // Export weather data
  async exportWeatherDataCSV(): Promise<Blob> {
    const response = await api.get('/weather/export/csv', {
      responseType: 'blob'
    });
    return response.data;
  },

  async exportWeatherDataXLSX(): Promise<Blob> {
    const response = await api.get('/weather/export/xlsx', {
      responseType: 'blob'
    });
    return response.data;
  },
};
