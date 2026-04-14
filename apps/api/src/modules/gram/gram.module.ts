import { Module } from '@nestjs/common'
import { NotificationsModule } from '../notifications/notifications.module'
import { WebsocketsModule } from '../websockets/websockets.module'
import { GramController } from './gram.controller'
import { GramService } from './gram.service'

@Module({
  imports: [WebsocketsModule, NotificationsModule],
  controllers: [GramController],
  providers: [GramService],
  exports: [GramService],
})
export class GramModule {}
