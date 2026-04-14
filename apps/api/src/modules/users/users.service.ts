import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../../prisma/prisma.service'
import { MinioService } from '../media/minio.service'
import { ChangePasswordDto } from './dto/change-password.dto'
import { UpdateProfileDto } from './dto/update-profile.dto'

const PUBLIC_FIELDS = {
  id: true,
  email: true,
  username: true,
  role: true,
  avatar: true,
  bio: true,
  isActive: true,
  createdAt: true,
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) {}

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: PUBLIC_FIELDS,
    })

    if (!user) throw new NotFoundException('User not found')

    return user
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } })
  }

  async updateProfile(id: number, dto: UpdateProfileDto) {
    if (dto.username) {
      const existing = await this.prisma.user.findFirst({
        where: { username: dto.username, NOT: { id } },
      })
      if (existing) throw new ConflictException('Username is already taken')
    }

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: PUBLIC_FIELDS,
    })
  }

  async updateAvatar(id: number, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id },
      data: { avatar: avatarUrl },
      select: PUBLIC_FIELDS,
    })
  }

  async uploadAvatar(id: number, file: Express.Multer.File) {
    const ext = file.originalname.split('.').pop() ?? 'jpg'
    const objectName = `avatars/${id}-${Date.now()}.${ext}`
    await this.minio.putObject(objectName, file.buffer, file.mimetype)
    const url = this.minio.getObjectUrl(objectName)
    return this.updateAvatar(id, url)
  }

  async changePassword(id: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('User not found')

    const match = await bcrypt.compare(dto.currentPassword, user.passwordHash)
    if (!match) throw new BadRequestException('Текущий пароль неверный')

    const newHash = await bcrypt.hash(dto.newPassword, 12)
    await this.prisma.user.update({ where: { id }, data: { passwordHash: newHash } })

    return { success: true }
  }

  async setActive(id: number, isActive: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('User not found')

    return this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: PUBLIC_FIELDS,
    })
  }

  // ── Кабинет ────────────────────────────────────────────────────────────────

  async getMyGramPosts(userId: number) {
    return this.prisma.gramPost.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        tags: { select: { id: true, slug: true, name: true } },
        _count: { select: { likes: true, comments: true } },
      },
    })
  }

  async getMyComments(userId: number) {
    return this.prisma.comment.findMany({
      where: { authorId: userId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        gramPost: { select: { id: true, content: true } },
        blogPost: { select: { id: true, title: true, slug: true } },
      },
    })
  }

  async getMyForumActivity(userId: number) {
    const [threads, posts] = await Promise.all([
      this.prisma.forumThread.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: 'desc' },
        take: 30,
        include: {
          section: { select: { id: true, slug: true, title: true } },
          _count: { select: { posts: true } },
        },
      }),
      this.prisma.forumPost.findMany({
        where: { authorId: userId, isDeleted: false },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          thread: {
            select: {
              id: true,
              title: true,
              slug: true,
              section: { select: { slug: true } },
            },
          },
        },
      }),
    ])

    return { threads, posts }
  }
}
