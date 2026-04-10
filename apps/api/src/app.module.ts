import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Модули подключаются по мере реализации фаз:
    // PrismaModule   — Шаг 1.1
    // AuthModule     — Шаг 1.2
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
