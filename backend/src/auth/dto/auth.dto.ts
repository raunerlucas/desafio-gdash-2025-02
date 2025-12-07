import {IsEmail, IsString} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'admin@gdash.com',
    description: 'Email do usuário',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'admin123',
    description: 'Senha do usuário',
  })
  @IsString()
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token JWT de autenticação',
  })
  access_token: string;

  @ApiProperty({
    description: 'Dados do usuário autenticado',
    example: {
      _id: '507f1f77bcf86cd799439011',
      email: 'admin@gdash.com',
      name: 'Admin User',
      role: 'admin',
    },
  })
  user: {
    _id: string;
    email: string;
    name: string;
    role: string;
  };
}
