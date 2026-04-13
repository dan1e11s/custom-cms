import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { AppGateway } from './app.gateway'

@Module({
  imports: [
    ConfigModule,
    // JwtModule без конфига — секрет передаём явно в jwtService.verify()
    JwtModule.register({}),
  ],
  providers: [AppGateway],
  exports: [AppGateway],
})
export class WebsocketsModule {}
