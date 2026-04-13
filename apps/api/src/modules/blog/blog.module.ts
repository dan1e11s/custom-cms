import { Module } from '@nestjs/common'
import { BlogAdminController, BlogPublicController } from './blog.controller'
import { BlogService } from './blog.service'

@Module({
  controllers: [BlogPublicController, BlogAdminController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogModule {}
