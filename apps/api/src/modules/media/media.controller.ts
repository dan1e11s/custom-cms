import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Role } from '@prisma/client'
import { memoryStorage } from 'multer'
import { Body } from '@nestjs/common'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { UpdateMediaDto } from './dto/update-media.dto'
import { MediaService } from './media.service'

@ApiTags('Media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @ApiOperation({ summary: 'Загрузить изображение' })
  @ApiConsumes('multipart/form-data')
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  upload(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: { id: number }) {
    return this.mediaService.upload(file, user.id)
  }

  @ApiOperation({ summary: 'Медиатека (ADMIN, с пагинацией)' })
  @Roles(Role.ADMIN)
  @Get()
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.mediaService.findAll(page, limit)
  }

  @ApiOperation({ summary: 'Обновить ALT текст медиафайла' })
  @Roles(Role.ADMIN)
  @Patch(':id')
  updateAlt(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMediaDto) {
    return this.mediaService.updateAlt(id, dto)
  }

  @ApiOperation({ summary: 'Удалить медиафайл (из MinIO и БД)' })
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.remove(id)
  }
}
