import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './modules/auth/auth.module'
import { PrismaModule } from './prisma/prisma.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    // Модули подключаются по мере реализации фаз:
    // UsersModule    — Шаг 1.3
    // PagesModule    — Фаза 2
    // CatalogModule  — Фаза 3
    // BlogModule     — Фаза 3
    // GramModule     — Фаза 4
    // ForumModule    — Фаза 4
    // MediaModule    — Фаза 3
    // SeoModule      — Фаза 2
    // NotificationsModule — Фаза 4
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
