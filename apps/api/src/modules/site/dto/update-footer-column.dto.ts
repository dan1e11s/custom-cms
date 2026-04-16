import { PartialType } from '@nestjs/swagger'
import { CreateFooterColumnDto } from './create-footer-column.dto'

export class UpdateFooterColumnDto extends PartialType(CreateFooterColumnDto) {}
