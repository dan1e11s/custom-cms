import { PartialType } from '@nestjs/swagger'
import { CreateFooterLinkDto } from './create-footer-link.dto'

export class UpdateFooterLinkDto extends PartialType(CreateFooterLinkDto) {}
