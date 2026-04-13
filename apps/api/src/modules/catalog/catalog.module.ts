import { Module } from '@nestjs/common'
import { CatalogAdminController, CatalogPublicController } from './catalog.controller'
import { CatalogService } from './catalog.service'

@Module({
  controllers: [CatalogPublicController, CatalogAdminController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
