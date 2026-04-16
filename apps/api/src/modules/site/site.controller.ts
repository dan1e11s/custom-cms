import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Public } from '../../common/decorators/public.decorator'
import { SiteService } from './site.service'

@ApiTags('site')
@Controller('site')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Get('navigation')
  @Public()
  @ApiOperation({ summary: 'Получить навигацию шапки (публичная, только видимые пункты)' })
  getNavigation() {
    return this.siteService.getNavigation(true)
  }

  @Get('footer')
  @Public()
  @ApiOperation({ summary: 'Получить колонки и ссылки футера' })
  getFooter() {
    return this.siteService.getFooter()
  }

  @Get('settings')
  @Public()
  @ApiOperation({ summary: 'Получить настройки сайта (название, логотип, копирайт)' })
  getSettings() {
    return this.siteService.getSettings()
  }
}
