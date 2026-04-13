import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerModule } from '@nestjs/throttler'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { RolesGuard } from './common/guards/roles.guard'
import { AuthModule } from './modules/auth/auth.module'
import { CatalogModule } from './modules/catalog/catalog.module'
import { MediaModule } from './modules/media/media.module'
import { PagesModule } from './modules/pages/pages.module'
import { SeoModule } from './modules/seo/seo.module'
import { UsersModule } from './modules/users/users.module'
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
    UsersModule,
    MediaModule,
    PagesModule,
    SeoModule,
    CatalogModule,
    // Модули подключаются по мере реализации фаз:
    // [x] PagesModule  — Фаза 2
    // [x] SeoModule    — Фаза 2
    // [x] CatalogModule — Фаза 3
    // BlogModule     — Фаза 3
    // GramModule     — Фаза 4
    // ForumModule    — Фаза 4
    // NotificationsModule — Фаза 4
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
