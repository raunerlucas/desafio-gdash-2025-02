import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WeatherLogDocument = WeatherLog & Document;

@Schema({ timestamps: true })
export class WeatherLog {
  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  temperature: number;

  @Prop({ required: true })
  humidity: number;

  @Prop({ required: true })
  pressure: number;

  @Prop()
  description: string;

  @Prop()
  windSpeed: number;

  @Prop()
  windDirection: string;

  @Prop()
  visibility: number;

  @Prop()
  uvIndex: number;

  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop()
  source: string; // Ex: "worker-go", "manual", etc.
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);
