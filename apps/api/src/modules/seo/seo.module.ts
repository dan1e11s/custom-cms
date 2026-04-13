import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { SeoAdminController, SeoPublicController } from './seo.controller'
import { SeoService } from './seo.service'
import { SitemapService } from './sitemap.service'

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [SeoPublicController, SeoAdminController],
  providers: [SeoService, SitemapService],
  exports: [SeoService, SitemapService],
})
export class SeoModule {}
