import {
	Injectable,
	BadRequestException,
	InternalServerErrorException,
	ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
// import { Resend } from 'resend';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto } from './dto/auth.dto';
// import { SendOtpDto } from './dto/send-otp.dto';
// import { VerifyOtpDto } from './dto/verify-otp.dto'; bcrypt 
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
// import { PrismaClientKnownRequestError } from 'generated/prisma/internal/prismaNamespace';

@Injectable()
export class AuthService {

	// private resend: Resend;
	private readonly SALT_ROUNDS = 10;

	constructor(
		private prisma: PrismaService,
		private jwtService: JwtService,
		private configService: ConfigService,
	) {
		// this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
	}

	async signUp(dto: SignUpDto): Promise<{ message: string; accessToken: string }> {

		const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
		const hasedPassword = await bcrypt.hash(dto.password, salt);

		try {

			const user = await this.prisma.user.create({
				data: {
					name: dto.name,
					email: dto.email,
					password: hasedPassword,
				},
			});

			const accessToken = await this.signToken(user.id, user.email);
			return { message: 'User registered successfully', accessToken };

		} catch(error) {
			// if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
			// 	throw new ConflictException('Email is already registered');
			// }
			throw new InternalServerErrorException('Registration failed');

		}

	}

	private async signToken(userId: string, email: string): Promise<string> {
		const payload = { sub: userId, email};
		return this.jwtService.signAsync(payload, {
			expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1d') as any,
			secret: this.configService.getOrThrow<string>('JWT_SECRET'),
		});
	}

  // ─── Send OTP ────────────────────────────────────────────────────────────────

  // async sendOtp(dto: SendOtpDto) {
  //   const { email } = dto;

  //   // Generate 6-digit OTP
  //   const otp = Math.floor(100000 + Math.random() * 900000).toString();

  //   // Expire any previous unused OTPs for this email
  //   await this.prisma.otpVerification.updateMany({
  //     where: { email, used: false },
  //     data: { used: true },
  //   });

  //   // Save new OTP (expires in 10 minutes)
  //   await this.prisma.otpVerification.create({
  //     data: {
  //       email,
  //       otp,
  //       expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  //     },
  //   });

  //   // Send email via Resend
  //   const from = this.configService.get<string>('MAIL_FROM');
  //   const { error } = await this.resend.emails.send({
  //     from: `BookMyTrip <${from}>`,
  //     to: email,
  //     subject: 'Your OTP - BookMyTrip',
  //     html: `
  //       <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto;">
  //         <h2 style="color: #e63946;">BookMyTrip ✈️</h2>
  //         <p>Your One-Time Password is:</p>
  //         <h1 style="letter-spacing: 8px; color: #333;">${otp}</h1>
  //         <p style="color: #888;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
  //       </div>
  //     `,
  //   });

  //   if (error) {
  //     throw new InternalServerErrorException('Failed to send OTP email');
  //   }

  //   return { message: 'OTP sent successfully. Please check your email.' };
  // }

  // // ─── Verify OTP & Sign In / Sign Up ──────────────────────────────────────────

//   async verifyOtp(dto: VerifyOtpDto) {
//     const { email, otp } = dto;

//     // Find valid OTP
//     const record = await this.prisma.otpVerification.findFirst({
//       where: {
//         email,
//         otp,
//         used: false,
//         expiresAt: { gt: new Date() },
//       },
//     });

//     if (!record) {
//       throw new BadRequestException('Invalid or expired OTP');
//     }

//     // Mark OTP as used
//     await this.prisma.otpVerification.update({
//       where: { id: record.id },
//       data: { used: true },
//     });

//     // Upsert user — create if new, return existing if already registered
//     const user = await this.prisma.user.upsert({
//       where: { email },
//       update: { isVerified: true },
//       create: { email, isVerified: true },
//     });

//     const isNewUser = !user.name; // name is null for brand new users

//     // Generate JWT
//     const token = this.jwtService.sign({
//       sub: user.id,
//       email: user.email,
//     });

//     return {
//       message: isNewUser ? 'Account created successfully' : 'Logged in successfully',
//       isNewUser,
//       token,
//       user: {
//         id: user.id,
//         email: user.email,
//         name: user.name,
//         isVerified: user.isVerified,
//       },
//     };
//   }
}
