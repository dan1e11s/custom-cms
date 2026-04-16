import { PartialType } from '@nestjs/swagger'
import { CreateNavItemDto } from './create-nav-item.dto'

export class UpdateNavItemDto extends PartialType(CreateNavItemDto) {}
