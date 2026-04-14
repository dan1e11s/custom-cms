import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

/**
 * Глобальный сервис для инвалидации Next.js Data Cache через тэги.
 * Вызывать fire-and-forget: this.revalidation.revalidate('tag').catch(() => {})
 */
@Injectable()
export class RevalidationService {
  private readonly logger = new Logger(RevalidationService.name)

  constructor(private readonly config: ConfigService) {}

  async revalidate(tag: string): Promise<void> {
    const frontendUrl = this.config.get<string>('FRONTEND_URL')
    const secret = this.config.get<string>('REVALIDATE_SECRET')

    if (!frontendUrl || !secret) {
      this.logger.warn(
        `Revalidation skipped (tag: "${tag}"): FRONTEND_URL or REVALIDATE_SECRET not set`,
      )
      return
    }

    try {
      const res = await fetch(`${frontendUrl}/api/revalidate?tag=${encodeURIComponent(tag)}`, {
        method: 'POST',
        headers: { 'x-revalidate-secret': secret },
      })
      if (!res.ok) {
        this.logger.warn(`Revalidation failed for tag "${tag}": HTTP ${res.status}`)
      }
    } catch (err) {
      this.logger.warn(`Revalidation error for tag "${tag}": ${String(err)}`)
    }
  }

  /** Инвалидирует несколько тэгов параллельно */
  revalidateAll(tags: string[]): void {
    for (const tag of tags) {
      this.revalidate(tag).catch(() => {})
    }
  }
}
