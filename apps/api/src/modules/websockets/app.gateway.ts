import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/ws',
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(AppGateway.name)

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket Gateway инициализирован на /ws')
  }

  // ── Подключение ─────────────────────────────────────────────────────────────

  async handleConnection(client: Socket) {
    const token =
      client.handshake.auth?.token ||
      (client.handshake.headers.authorization?.startsWith('Bearer ')
        ? client.handshake.headers.authorization.slice(7)
        : null)

    if (!token) {
      // Анонимное подключение — разрешаем, но без личной комнаты
      client.data.user = null
      this.logger.debug(`Анонимное подключение: ${client.id}`)
      return
    }

    try {
      const payload = this.jwtService.verify<{ sub: number; role: string }>(token, {
        secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
      })
      client.data.user = payload
      // Личная комната для уведомлений
      client.join(`user:${payload.sub}`)
      this.logger.debug(`Подключён user:${payload.sub} (${client.id})`)
    } catch {
      // Невалидный токен — анонимное подключение (не отключаем)
      client.data.user = null
      this.logger.debug(`Невалидный токен, анонимное подключение: ${client.id}`)
    }
  }

  // ── Отключение ──────────────────────────────────────────────────────────────

  handleDisconnect(client: Socket) {
    const userId = client.data.user?.sub
    this.logger.debug(`Отключён${userId ? ` user:${userId}` : ''} (${client.id})`)
  }

  // ── Управление комнатами ────────────────────────────────────────────────────

  /** Подписаться на общую ленту Gram */
  @SubscribeMessage('gram:join')
  handleGramJoin(client: Socket) {
    client.join('gram:feed')
    return { event: 'gram:joined', data: 'gram:feed' }
  }

  /** Отписаться от ленты Gram */
  @SubscribeMessage('gram:leave')
  handleGramLeave(client: Socket) {
    client.leave('gram:feed')
  }

  /** Подписаться на тему форума */
  @SubscribeMessage('forum:join')
  handleForumJoin(client: Socket, threadId: number) {
    client.join(`forum:thread:${threadId}`)
    return { event: 'forum:joined', data: `forum:thread:${threadId}` }
  }

  /** Отписаться от темы форума */
  @SubscribeMessage('forum:leave')
  handleForumLeave(client: Socket, threadId: number) {
    client.leave(`forum:thread:${threadId}`)
  }

  /** Индикатор "пользователь печатает" — ретранслируем в комнату темы */
  @SubscribeMessage('forum:typing')
  handleForumTyping(client: Socket, threadId: number) {
    const username = client.data.user?.username ?? 'Аноним'
    client.to(`forum:thread:${threadId}`).emit('forum:user_typing', { threadId, username })
  }

  // ── Утилиты для сервисов ────────────────────────────────────────────────────

  /** Отправить событие в комнату (используется из GramService, ForumService) */
  emit(room: string, event: string, data: unknown) {
    this.server.to(room).emit(event, data)
  }

  /** Отправить личное уведомление пользователю */
  emitToUser(userId: number, event: string, data: unknown) {
    this.server.to(`user:${userId}`).emit(event, data)
  }
}
