import { Module } from '@nestjs/common'
import { PagesAdminController, PagesPublicController } from './pages.controller'
import { PagesService } from './pages.service'

@Module({
  controllers: [PagesPublicController, PagesAdminController],
  providers: [PagesService],
  exports: [PagesService],
})
export class PagesModule {}
