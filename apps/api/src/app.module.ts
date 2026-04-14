import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerModule } from '@nestjs/throttler'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { RolesGuard } from './common/guards/roles.guard'
import { RevalidationModule } from './common/revalidation/revalidation.module'
import { AdminModule } from './modules/admin/admin.module'
import { AuthModule } from './modules/auth/auth.module'
import { BlogModule } from './modules/blog/blog.module'
import { CatalogModule } from './modules/catalog/catalog.module'
import { ForumModule } from './modules/forum/forum.module'
import { GramModule } from './modules/gram/gram.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { MediaModule } from './modules/media/media.module'
import { PagesModule } from './modules/pages/pages.module'
import { SeoModule } from './modules/seo/seo.module'
import { UsersModule } from './modules/users/users.module'
import { WebsocketsModule } from './modules/websockets/websockets.module'
import { PrismaModule } from './prisma/prisma.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    RevalidationModule,
    AdminModule,
    AuthModule,
    UsersModule,
    MediaModule,
    PagesModule,
    SeoModule,
    CatalogModule,
    BlogModule,
    WebsocketsModule,
    GramModule,
    ForumModule,
    NotificationsModule,
    // Модули подключаются по мере реализации фаз:
    // [x] PagesModule      — Фаза 2
    // [x] SeoModule        — Фаза 2
    // [x] CatalogModule    — Фаза 3
    // [x] BlogModule       — Фаза 3
    // [x] WebsocketsModule — Фаза 4
    // [x] GramModule       — Фаза 4
    // [x] ForumModule          — Фаза 4
    // [x] NotificationsModule  — Фаза 4
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
