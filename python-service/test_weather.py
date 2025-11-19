"""
Test script for Python Weather Service
Tests the weather collection without RabbitMQ dependency
"""
import asyncio
import os

from dotenv import load_dotenv

# Set environment variables for testing
os.environ['LOCATION_LATITUDE'] = '-23.5505'
os.environ['LOCATION_LONGITUDE'] = '-46.6333'

from main import WeatherCollector

async def test_weather_collection():
    """Test weather data collection"""
    print("Testing Weather Data Collection...")
    print("-" * 50)

    collector = WeatherCollector()

    try:
        # Collect weather data
        weather_data = await collector.collect_weather_data()

        print("\n✅ Weather data collected successfully!")
        print(f"\n📍 Location: {weather_data['location']['latitude']}, {weather_data['location']['longitude']}")
        print(f"🕐 Timestamp: {weather_data['timestamp']}")
        print(f"🌡️  Temperature: {weather_data['current']['temperature']}°C")
        print(f"💧 Humidity: {weather_data['current']['humidity']}%")
        print(f"🌧️  Precipitation: {weather_data['current']['precipitation']} mm")
        print(f"💨 Wind Speed: {weather_data['current']['wind_speed']} km/h")
        print(f"☁️  Weather Code: {weather_data['current']['weather_code']}")

        # Decode weather code
        weather_codes = {
            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy",
            3: "Overcast",
            45: "Foggy",
            48: "Depositing rime fog",
            51: "Light drizzle",
            53: "Moderate drizzle",
            55: "Dense drizzle",
            61: "Slight rain",
            63: "Moderate rain",
            65: "Heavy rain",
            71: "Slight snow",
            73: "Moderate snow",
            75: "Heavy snow",
            80: "Slight rain showers",
            81: "Moderate rain showers",
            82: "Violent rain showers",
            95: "Thunderstorm",
            96: "Thunderstorm with slight hail",
            99: "Thunderstorm with heavy hail"
        }

        weather_desc = weather_codes.get(weather_data['current']['weather_code'], "Unknown")
        print(f"🌤️  Description: {weather_desc}")

        print("\n" + "-" * 50)
        print("✅ Test completed successfully!")

        return weather_data

    except Exception as e:
        print(f"\n❌ Error: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(test_weather_collection())

