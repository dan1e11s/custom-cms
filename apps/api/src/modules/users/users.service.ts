import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
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
  constructor(private readonly prisma: PrismaService) {}

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

  async setActive(id: number, isActive: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('User not found')

    return this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: PUBLIC_FIELDS,
    })
  }
}
