import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({

  imports: [
    ConfigModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
    // imports: [
  //   JwtModule.registerAsync({
  //     imports: [ConfigModule],
  //     inject: [ConfigService],
  //     useFactory: (config: ConfigService) => ({
  //       secret: config.get<string>('JWT_SECRET'),
  //       signOptions: {
  //         expiresIn: config.get('JWT_EXPIRES_IN', '7d'),
  //       },
  //     }),
  //   }),
  // ],
  // exports: [Auth]
})
export class AuthModule {}

