import { IsDateString } from 'class-validator'

export class SchedulePublishDto {
  @IsDateString()
  publishAt: string
}
