import { Module } from '@nestjs/common'
import { WebsocketsModule } from '../websockets/websockets.module'
import { ForumAdminController, ForumPublicController } from './forum.controller'
import { ForumService } from './forum.service'

@Module({
  imports: [WebsocketsModule],
  controllers: [ForumPublicController, ForumAdminController],
  providers: [ForumService],
  exports: [ForumService],
})
export class ForumModule {}
