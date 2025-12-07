import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {MongooseModule} from '@nestjs/mongoose';
import {ThrottlerModule} from '@nestjs/throttler';
import {AuthModule} from './auth/auth.module';
import {UsersModule} from './users/users.module';
import {WeatherModule} from './weather/weather.module';
import {PokemonModule} from './pokemon/pokemon.module';
import {HealthController} from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    }]),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/climate-db'),
    AuthModule,
    UsersModule,
    WeatherModule,
    PokemonModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
