import { Module } from '@nestjs/common'
import { WebsocketsModule } from '../websockets/websockets.module'
import { GramController } from './gram.controller'
import { GramService } from './gram.service'

@Module({
  imports: [WebsocketsModule],
  controllers: [GramController],
  providers: [GramService],
  exports: [GramService],
})
export class GramModule {}
