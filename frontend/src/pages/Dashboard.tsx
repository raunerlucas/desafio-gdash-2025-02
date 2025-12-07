import React, {useEffect, useState} from 'react';
import {Card} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {weatherService} from '@/services/weatherService';
import {AIInsight, WeatherData} from '@/types/weather';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    AlertTriangle,
    Calendar,
    Cloud,
    Download,
    Droplets,
    Info,
    MapPin,
    Thermometer,
    TrendingUp,
    Wind,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [weatherHistory, setWeatherHistory] = useState<WeatherData[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [currentData, historyData, insightsData] = await Promise.all([
        weatherService.getCurrentWeather(),
        weatherService.getWeatherHistory(24), // Last 24 records
        weatherService.getAIInsights(),
      ]);

      console.log('📊 Dashboard data loaded:', {
        currentData,
        historyCount: historyData?.length,
        insightsCount: insightsData?.length
      });

      setCurrentWeather(currentData);
      setWeatherHistory(historyData || []);
      setAiInsights(insightsData || []);

    } catch (err: any) {
      console.error('❌ Dashboard loading error:', err);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });

      // Se não houver dados, mostrar mensagem informativa
      if (err.response?.status === 404) {
        setError('⏳ Aguardando primeira coleta de dados climáticos. O Python Service coleta dados a cada hora.');
      } else if (err.response?.status === 401) {
        setError('🔒 Sessão expirada. Por favor, faça login novamente.');
      } else if (err.code === 'ECONNABORTED' || err.message === 'Request aborted') {
        setError('⏱️ Tempo de requisição esgotado. Tente novamente.');
      } else {
        setError('⚠️ Erro ao carregar dados. Verifique o console (F12) para mais detalhes.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await weatherService.exportWeatherDataCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weather-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting CSV:', err);
    }
  };

  const handleExportXLSX = async () => {
    try {
      const blob = await weatherService.exportWeatherDataXLSX();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weather-data-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting XLSX:', err);
    }
  };

  const formatChartData = (data: WeatherData[]) => {
    return data.map(item => ({
      time: new Date(item.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      temperature: item.temperature || 0,
      humidity: item.humidity || 0,
      windSpeed: item.windSpeed || 0,
    }));
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar dados</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadDashboardData}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Clima</h1>
          <p className="text-gray-600 mt-1">
            Dados em tempo real e insights de IA sobre o clima
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={handleExportXLSX}>
            <Download className="h-4 w-4 mr-2" />
            Exportar XLSX
          </Button>
        </div>
      </div>

      {/* Current Weather Cards */}
      {currentWeather && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Temperatura</p>
                <p className="text-3xl font-bold text-gray-900">
                  {currentWeather.temperature}°C
                </p>
              </div>
              <Thermometer className="h-12 w-12 text-red-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Umidade</p>
                <p className="text-3xl font-bold text-gray-900">
                  {currentWeather.humidity}%
                </p>
              </div>
              <Droplets className="h-12 w-12 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vento</p>
                <p className="text-3xl font-bold text-gray-900">
                  {currentWeather.windSpeed || 0} km/h
                </p>
              </div>
              <Wind className="h-12 w-12 text-gray-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pressão</p>
                <p className="text-3xl font-bold text-gray-900">
                  {currentWeather.pressure} hPa
                </p>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {currentWeather.location}
                </p>
              </div>
              <Cloud className="h-12 w-12 text-gray-400" />
            </div>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Temperatura ao Longo do Tempo
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formatChartData(weatherHistory)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#ef4444"
                strokeWidth={2}
                name="Temperatura (°C)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Humidity and Wind Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Umidade e Velocidade do Vento
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={formatChartData(weatherHistory)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="humidity"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
                name="Umidade (%)"
              />
              <Area
                type="monotone"
                dataKey="windSpeed"
                stackId="2"
                stroke="#6b7280"
                fill="#6b7280"
                fillOpacity={0.6}
                name="Vento (km/h)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* AI Insights and Weather Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Insights */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Insights de IA
            </h3>
            <div className="space-y-4">
              {aiInsights.slice(0, 5).map((insight) => (
                <div key={insight.id} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-start space-x-2">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{insight.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
                      <p className="text-xs text-gray-400 mt-2 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(insight.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Weather Records Table */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Registros Recentes
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Data/Hora</th>
                    <th className="text-left py-2">Local</th>
                    <th className="text-left py-2">Condição</th>
                    <th className="text-left py-2">Temp (°C)</th>
                    <th className="text-left py-2">Umidade (%)</th>
                    <th className="text-left py-2">Vento (km/h)</th>
                  </tr>
                </thead>
                <tbody>
                  {weatherHistory.slice(0, 10).map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="py-2">
                        {new Date(record.timestamp).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-2">{record.location}</td>
                      <td className="py-2 capitalize">{record.condition}</td>
                      <td className="py-2">{record.temperature}</td>
                      <td className="py-2">{record.humidity}</td>
                      <td className="py-2">{record.windSpeed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
