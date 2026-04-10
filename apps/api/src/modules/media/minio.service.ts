import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as Minio from 'minio'

@Injectable()
export class MinioService implements OnModuleInit {
  private client: Minio.Client
  private bucket: string

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('MINIO_BUCKET', 'cms-media')

    this.client = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT', 'localhost'),
      port: this.configService.get<number>('MINIO_PORT', 9000),
      useSSL: false,
      accessKey: this.configService.getOrThrow<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.getOrThrow<string>('MINIO_SECRET_KEY'),
    })
  }

  async onModuleInit() {
    const exists = await this.client.bucketExists(this.bucket)
    if (!exists) {
      await this.client.makeBucket(this.bucket)
    }
  }

  async putObject(objectName: string, buffer: Buffer, contentType: string) {
    await this.client.putObject(this.bucket, objectName, buffer, buffer.length, {
      'Content-Type': contentType,
    })
  }

  async removeObject(objectName: string) {
    await this.client.removeObject(this.bucket, objectName)
  }

  getObjectUrl(objectName: string): string {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost')
    const port = this.configService.get<number>('MINIO_PORT', 9000)
    return `http://${endpoint}:${port}/${this.bucket}/${objectName}`
  }
}
