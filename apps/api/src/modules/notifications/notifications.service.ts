import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { AppGateway } from '../websockets/app.gateway'

export interface NotificationPayload {
  actorName: string
  text: string
  url: string
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: AppGateway,
  ) {}

  /**
   * Создаёт уведомление и отправляет через WS если пользователь онлайн.
   * Не уведомляем пользователя о его же действиях (userId === actorId).
   */
  async notify(
    userId: number,
    actorId: number,
    type: string,
    payload: NotificationPayload,
  ): Promise<void> {
    if (userId === actorId) return

    const notification = await this.prisma.notification.create({
      data: { userId, type, payload: payload as unknown as Prisma.InputJsonValue, isRead: false },
    })

    this.gateway.emitToUser(userId, 'notification', notification)
  }

  // ── API для пользователя ──────────────────────────────────────────────────

  async getMyNotifications(userId: number, limit = 30) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  async getUnreadCount(userId: number) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    })
    return { count }
  }

  async markAllRead(userId: number) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })
    return { success: true }
  }

  async markRead(id: number, userId: number) {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    })
    return { success: true }
  }

  async deleteAll(userId: number) {
    await this.prisma.notification.deleteMany({ where: { userId } })
    return { success: true }
  }
}
