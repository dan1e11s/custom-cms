import { Module } from '@nestjs/common'
import { SeoAdminController, SeoPublicController } from './seo.controller'
import { SeoService } from './seo.service'
import { SitemapService } from './sitemap.service'

@Module({
  controllers: [SeoPublicController, SeoAdminController],
  providers: [SeoService, SitemapService],
  exports: [SeoService, SitemapService],
})
export class SeoModule {}
