import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import * as sharp from 'sharp'
import { v4 as uuid } from 'uuid'
import { PrismaService } from '../../prisma/prisma.service'
import { UpdateMediaDto } from './dto/update-media.dto'
import { MinioService } from './minio.service'

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) {}

  async upload(file: Express.Multer.File, userId: number) {
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      throw new BadRequestException(`Unsupported file type. Allowed: ${ALLOWED_MIMES.join(', ')}`)
    }

    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestException('File size exceeds 10 MB limit')
    }

    const processed = await sharp(file.buffer)
      .resize(2000, null, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer()

    const thumb = await sharp(file.buffer)
      .resize(400, 300, { fit: 'cover' })
      .webp({ quality: 75 })
      .toBuffer()

    const filename = `${uuid()}.webp`
    const thumbname = `thumbs/${uuid()}.webp`

    await this.minio.putObject(filename, processed, 'image/webp')
    await this.minio.putObject(thumbname, thumb, 'image/webp')

    const url = this.minio.getObjectUrl(filename)

    return this.prisma.media.create({
      data: {
        filename,
        originalName: file.originalname,
        mimeType: 'image/webp',
        size: processed.length,
        url,
        uploadedById: userId,
      },
    })
  }

  async findAll(page: number, limit: number) {
    const [items, total] = await Promise.all([
      this.prisma.media.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { uploadedBy: { select: { id: true, username: true } } },
      }),
      this.prisma.media.count(),
    ])

    return { items, total, page, limit, pages: Math.ceil(total / limit) }
  }

  async updateAlt(id: number, dto: UpdateMediaDto) {
    const media = await this.prisma.media.findUnique({ where: { id } })
    if (!media) throw new NotFoundException('Media not found')

    return this.prisma.media.update({ where: { id }, data: dto })
  }

  async remove(id: number) {
    const media = await this.prisma.media.findUnique({ where: { id } })
    if (!media) throw new NotFoundException('Media not found')

    await this.minio.removeObject(media.filename)

    const thumbname = `thumbs/${media.filename}`
    try {
      await this.minio.removeObject(thumbname)
    } catch {
      // thumb может отсутствовать — не критично
    }

    await this.prisma.media.delete({ where: { id } })

    return { message: 'Media deleted successfully' }
  }
}
