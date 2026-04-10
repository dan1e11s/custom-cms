import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Role } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { Response } from 'express'
import { PrismaService } from '../../prisma/prisma.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { JwtPayload } from './strategies/jwt.strategy'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    })

    if (existing) {
      const field = existing.email === dto.email ? 'email' : 'username'
      throw new ConflictException(`User with this ${field} already exists`)
    }

    const passwordHash = await bcrypt.hash(dto.password, 12)

    const user = await this.prisma.user.create({
      data: { email: dto.email, username: dto.username, passwordHash },
      select: { id: true, email: true, username: true, role: true },
    })

    return { user }
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } })

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash)
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const tokens = this.generateTokens(user.id, user.role)
    this.setRefreshCookie(res, tokens.refreshToken)

    return {
      accessToken: tokens.accessToken,
      user: { id: user.id, email: user.email, username: user.username, role: user.role },
    }
  }

  logout(res: Response) {
    res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' })
    return { message: 'Logged out successfully' }
  }

  refreshTokens(userId: number, role: Role, res: Response) {
    const tokens = this.generateTokens(userId, role)
    this.setRefreshCookie(res, tokens.refreshToken)
    return { accessToken: tokens.accessToken }
  }

  private generateTokens(userId: number, role: Role) {
    const payload: JwtPayload = { sub: userId, role }

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES', '15m'),
    })

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES', '30d'),
    })

    return { accessToken, refreshToken }
  }

  private setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth/refresh',
    })
  }
}
