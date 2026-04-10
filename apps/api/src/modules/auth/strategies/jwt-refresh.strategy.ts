import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { JwtPayload } from './jwt.strategy'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const token = req?.cookies?.['refreshToken']
          if (!token) throw new UnauthorizedException('Refresh token not found')
          return token
        },
      ]),
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    })
  }

  async validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.cookies?.['refreshToken']
    return { ...payload, refreshToken }
  }
}
