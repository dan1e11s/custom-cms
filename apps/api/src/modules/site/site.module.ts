import { Module } from '@nestjs/common'
import { SiteService } from './site.service'
import { SiteController } from './site.controller'
import { SiteAdminController } from './site-admin.controller'

@Module({
  controllers: [SiteController, SiteAdminController],
  providers: [SiteService],
  exports: [SiteService],
})
export class SiteModule {}
