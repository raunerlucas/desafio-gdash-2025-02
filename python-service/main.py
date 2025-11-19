"""
GDASH Weather Data Collector
Collects weather data and sends to RabbitMQ
"""
import json
import logging
import os
import time
from datetime import datetime
from typing import Dict, Any

import httpx
import pika
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class WeatherCollector:
    """Collects weather data from external API"""

    def __init__(self):
        self.api_url = os.getenv('WEATHER_API_URL', 'https://api.open-meteo.com/v1/forecast')
        self.api_key = os.getenv('WEATHER_API_KEY', '')
        self.latitude = float(os.getenv('LOCATION_LATITUDE', '-23.5505'))
        self.longitude = float(os.getenv('LOCATION_LONGITUDE', '-46.6333'))

    async def collect_weather_data(self) -> Dict[str, Any]:
        """Collect current weather data"""
        try:
            async with httpx.AsyncClient() as client:
                # Using Open-Meteo API (no key required)
                params = {
                    'latitude': self.latitude,
                    'longitude': self.longitude,
                    'current': 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
                    'timezone': 'auto'
                }

                response = await client.get(self.api_url, params=params)
                response.raise_for_status()

                data = response.json()

                # Normalize data
                weather_data = {
                    'timestamp': datetime.utcnow().isoformat(),
                    'location': {
                        'latitude': self.latitude,
                        'longitude': self.longitude,
                        'timezone': data.get('timezone', 'UTC')
                    },
                    'current': {
                        'temperature': data['current']['temperature_2m'],
                        'humidity': data['current']['relative_humidity_2m'],
                        'precipitation': data['current']['precipitation'],
                        'wind_speed': data['current']['wind_speed_10m'],
                        'weather_code': data['current']['weather_code'],
                        'time': data['current']['time']
                    }
                }

                logger.info(f"Weather data collected: Temp={weather_data['current']['temperature']}°C, "
                           f"Humidity={weather_data['current']['humidity']}%")

                return weather_data

        except Exception as e:
            logger.error(f"Error collecting weather data: {e}")
            raise


class RabbitMQPublisher:
    """Publishes messages to RabbitMQ"""

    def __init__(self):
        self.host = os.getenv('RABBITMQ_HOST', 'rabbitmq')
        self.port = int(os.getenv('RABBITMQ_PORT', '5672'))
        self.user = os.getenv('RABBITMQ_USER', 'admin')
        self.password = os.getenv('RABBITMQ_PASSWORD', 'admin123')
        self.queue = os.getenv('RABBITMQ_QUEUE', 'weather_data')
        self.connection = None
        self.channel = None

    def connect(self):
        """Establish connection to RabbitMQ"""
        try:
            credentials = pika.PlainCredentials(self.user, self.password)
            parameters = pika.ConnectionParameters(
                host=self.host,
                port=self.port,
                credentials=credentials,
                heartbeat=600,
                blocked_connection_timeout=300
            )

            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()

            # Declare queue
            self.channel.queue_declare(queue=self.queue, durable=True)

            logger.info(f"Connected to RabbitMQ at {self.host}:{self.port}")

        except Exception as e:
            logger.error(f"Error connecting to RabbitMQ: {e}")
            raise

    def publish(self, message: Dict[str, Any]):
        """Publish message to queue"""
        try:
            if not self.channel or self.connection.is_closed:
                self.connect()

            self.channel.basic_publish(
                exchange='',
                routing_key=self.queue,
                body=json.dumps(message),
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Make message persistent
                    content_type='application/json'
                )
            )

            logger.info(f"Message published to queue '{self.queue}'")

        except Exception as e:
            logger.error(f"Error publishing message: {e}")
            raise

    def close(self):
        """Close connection"""
        if self.connection and not self.connection.is_closed:
            self.connection.close()
            logger.info("RabbitMQ connection closed")


async def main():
    """Main execution loop"""
    logger.info("Starting Weather Data Collector...")

    collector = WeatherCollector()
    publisher = RabbitMQPublisher()

    # Wait for RabbitMQ to be ready
    max_retries = 10
    retry_delay = 5

    for attempt in range(max_retries):
        try:
            publisher.connect()
            break
        except Exception as e:
            logger.warning(f"RabbitMQ not ready (attempt {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
            else:
                logger.error("Could not connect to RabbitMQ after max retries")
                raise

    collection_interval = int(os.getenv('COLLECTION_INTERVAL', '3600'))
    logger.info(f"Collection interval: {collection_interval} seconds")

    try:
        while True:
            try:
                # Collect weather data
                weather_data = await collector.collect_weather_data()

                # Publish to RabbitMQ
                publisher.publish(weather_data)

                logger.info(f"Waiting {collection_interval} seconds for next collection...")
                time.sleep(collection_interval)

            except Exception as e:
                logger.error(f"Error in collection cycle: {e}")
                time.sleep(60)  # Wait 1 minute before retry

    except KeyboardInterrupt:
        logger.info("Shutting down...")
    finally:
        publisher.close()


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())

