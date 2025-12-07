import {api} from './api';
import {AIInsight, WeatherData} from '@/types/weather';

interface WeatherLogsResponse {
  data: WeatherData[];
  total: number;
  page: number;
  totalPages: number;
}

interface WeatherInsightResponse {
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

export const weatherService = {
  // Get weather logs with pagination
  async getWeatherLogs(params?: {
    page?: number;
    limit?: number;
    location?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<WeatherLogsResponse> {
    const response = await api.get('/weather/logs', { params });
    return response.data;
  },

  // Get current weather (latest record)
  async getCurrentWeather(): Promise<WeatherData | null> {
    const response = await this.getWeatherLogs({ limit: 1 });
    return response.data.length > 0 ? response.data[0] : null;
  },

  // Get weather history
  async getWeatherHistory(limit = 24): Promise<WeatherData[]> {
    const response = await this.getWeatherLogs({ limit });
    return response.data;
  },

  // Get AI insights
  async getAIInsights(): Promise<AIInsight[]> {
    const response = await api.get('/weather/insights');
    const insights: WeatherInsightResponse = response.data;

    // Convert backend insights to frontend format
    const aiInsights: AIInsight[] = insights.recommendations.map((rec, index) => ({
      id: `insight-${index}`,
      type: this.getInsightType(rec),
      title: this.getInsightTitle(rec),
      message: rec,
      timestamp: new Date(),
      severity: this.getInsightSeverity(rec),
    }));

    // Add trend insight
    if (insights.temperatureTrend !== 'stable') {
      aiInsights.unshift({
        id: 'trend-insight',
        type: insights.temperatureTrend === 'rising' ? 'warning' : 'info',
        title: 'Tendência de Temperatura',
        message: `Temperatura ${insights.temperatureTrend === 'rising' ? 'subindo' : 'descendo'} nos últimos registros`,
        timestamp: new Date(),
        severity: 'medium',
      });
    }

    return aiInsights;
  },

  // Export weather data as CSV
  async exportWeatherDataCSV(): Promise<Blob> {
    const response = await api.get('/weather/export.csv', {
      responseType: 'blob',
    });
    return response.data;
  },

  // Export weather data as XLSX
  async exportWeatherDataXLSX(): Promise<Blob> {
    const response = await api.get('/weather/export.xlsx', {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get weather insights raw data
  async getWeatherInsightsRaw(): Promise<WeatherInsightResponse> {
    const response = await api.get('/weather/insights');
    return response.data;
  },

  // Helper methods
  getInsightType(recommendation: string): 'alert' | 'info' | 'warning' {
    const lowerRec = recommendation.toLowerCase();
    if (lowerRec.includes('extremo') || lowerRec.includes('alto') || lowerRec.includes('cuidado')) {
      return 'alert';
    }
    if (lowerRec.includes('atenção') || lowerRec.includes('recomenda')) {
      return 'warning';
    }
    return 'info';
  },

  getInsightTitle(recommendation: string): string {
    const lowerRec = recommendation.toLowerCase();
    if (lowerRec.includes('temperatura')) return 'Alerta de Temperatura';
    if (lowerRec.includes('umidade')) return 'Condição de Umidade';
    if (lowerRec.includes('tendência')) return 'Tendência Climática';
    if (lowerRec.includes('normal')) return 'Condições Normais';
    return 'Insight Climático';
  },

  getInsightSeverity(recommendation: string): 'low' | 'medium' | 'high' {
    const lowerRec = recommendation.toLowerCase();
    if (lowerRec.includes('extremo') || lowerRec.includes('alto')) return 'high';
    if (lowerRec.includes('atenção') || lowerRec.includes('recomenda')) return 'medium';
    return 'low';
  },
};
