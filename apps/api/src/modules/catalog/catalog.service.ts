import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { PageStatus, Prisma } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { buildTree, generateSlug } from './catalog.utils'
import { CreateCategoryDto } from './dto/create-category.dto'
import { CreateProductDto } from './dto/create-product.dto'
import { FilterProductsDto } from './dto/filter-products.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { UpdateProductDto } from './dto/update-product.dto'

const PRODUCT_SELECT = {
  id: true,
  slug: true,
  name: true,
  description: true,
  price: true,
  oldPrice: true,
  images: true,
  inStock: true,
  status: true,
  seoTitle: true,
  seoDesc: true,
  attributes: true,
  createdAt: true,
  categoryId: true,
  category: {
    select: { id: true, slug: true, name: true },
  },
}

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  // ══════════════════════════════════════════════════════════════════════════
  //  КАТЕГОРИИ
  // ══════════════════════════════════════════════════════════════════════════

  async getCategoryTree() {
    const categories = await this.prisma.category.findMany({
      where: { type: 'catalog' },
      orderBy: { name: 'asc' },
    })
    return buildTree(categories)
  }

  async getCategoryBySlug(slug: string) {
    const category = await this.prisma.category.findFirst({
      where: { slug, type: 'catalog' },
      include: { children: true },
    })
    if (!category) throw new NotFoundException(`Категория "${slug}" не найдена`)
    return category
  }

  async createCategory(dto: CreateCategoryDto) {
    const slug = dto.slug || generateSlug(dto.name)
    await this.ensureCategorySlugUnique(slug)

    if (dto.parentId) {
      await this.findCategoryById(dto.parentId)
    }

    return this.prisma.category.create({
      data: { ...dto, slug, type: 'catalog' },
    })
  }

  async updateCategory(id: number, dto: UpdateCategoryDto) {
    await this.findCategoryById(id)

    if (dto.slug) {
      await this.ensureCategorySlugUnique(dto.slug, id)
    }

    return this.prisma.category.update({ where: { id }, data: dto })
  }

  async deleteCategory(id: number) {
    await this.findCategoryById(id)

    // Проверяем, что нет дочерних категорий
    const childCount = await this.prisma.category.count({
      where: { parentId: id },
    })
    if (childCount > 0) {
      throw new ConflictException(
        'Нельзя удалить категорию с подкатегориями. Сначала удалите или перенесите вложенные категории.',
      )
    }

    await this.prisma.category.delete({ where: { id } })
    return { success: true }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  ТОВАРЫ (Публичные)
  // ══════════════════════════════════════════════════════════════════════════

  async findProducts(dto: FilterProductsDto) {
    const {
      categoryId,
      minPrice,
      maxPrice,
      inStock,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = dto

    const where: Prisma.ProductWhereInput = {
      status: PageStatus.PUBLISHED,
      ...(categoryId && { categoryId }),
      ...(minPrice !== undefined && { price: { gte: minPrice } }),
      ...(maxPrice !== undefined && {
        price: { ...(minPrice !== undefined ? { gte: minPrice } : {}), lte: maxPrice },
      }),
      ...(inStock !== undefined && { inStock }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const skip = (page - 1) * limit

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        select: PRODUCT_SELECT,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.product.count({ where }),
    ])

    return { items, total, page, limit, pages: Math.ceil(total / limit) }
  }

  async findProductBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, status: PageStatus.PUBLISHED },
      select: PRODUCT_SELECT,
    })
    if (!product) throw new NotFoundException(`Товар "${slug}" не найден`)
    return product
  }

  async findRelated(slug: string, take = 4) {
    const product = await this.prisma.product.findFirst({
      where: { slug },
      select: { id: true, categoryId: true },
    })
    if (!product) return []

    return this.prisma.product.findMany({
      where: {
        status: PageStatus.PUBLISHED,
        categoryId: product.categoryId ?? undefined,
        NOT: { id: product.id },
      },
      select: PRODUCT_SELECT,
      take,
      orderBy: { createdAt: 'desc' },
    })
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  ТОВАРЫ (Admin)
  // ══════════════════════════════════════════════════════════════════════════

  async findAllProducts(dto: FilterProductsDto) {
    const { search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = dto

    const where: Prisma.ProductWhereInput = {
      ...(dto.categoryId && { categoryId: dto.categoryId }),
      ...(dto.inStock !== undefined && { inStock: dto.inStock }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const skip = (page - 1) * limit

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        select: PRODUCT_SELECT,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.product.count({ where }),
    ])

    return { items, total, page, limit, pages: Math.ceil(total / limit) }
  }

  async findProductById(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: PRODUCT_SELECT,
    })
    if (!product) throw new NotFoundException(`Товар #${id} не найден`)
    return product
  }

  async createProduct(dto: CreateProductDto) {
    const slug = dto.slug || generateSlug(dto.name)
    await this.ensureProductSlugUnique(slug)

    if (dto.categoryId) {
      await this.findCategoryById(dto.categoryId)
    }

    return this.prisma.product.create({
      data: {
        ...dto,
        slug,
        price: dto.price !== undefined ? dto.price : undefined,
        oldPrice: dto.oldPrice !== undefined ? dto.oldPrice : undefined,
        images: dto.images ?? [],
        attributes: dto.attributes ?? Prisma.JsonNull,
        status: dto.status ?? PageStatus.DRAFT,
      },
      select: PRODUCT_SELECT,
    })
  }

  async updateProduct(id: number, dto: UpdateProductDto) {
    await this.findProductById(id)

    if (dto.slug) {
      await this.ensureProductSlugUnique(dto.slug, id)
    }
    if (dto.categoryId) {
      await this.findCategoryById(dto.categoryId)
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...dto,
        price: dto.price !== undefined ? dto.price : undefined,
        oldPrice: dto.oldPrice !== undefined ? dto.oldPrice : undefined,
        attributes: dto.attributes !== undefined ? dto.attributes : undefined,
      },
      select: PRODUCT_SELECT,
    })
  }

  async publishProduct(id: number) {
    await this.findProductById(id)
    return this.prisma.product.update({
      where: { id },
      data: { status: PageStatus.PUBLISHED },
      select: PRODUCT_SELECT,
    })
  }

  async unpublishProduct(id: number) {
    await this.findProductById(id)
    return this.prisma.product.update({
      where: { id },
      data: { status: PageStatus.DRAFT },
      select: PRODUCT_SELECT,
    })
  }

  async deleteProduct(id: number) {
    await this.findProductById(id)
    await this.prisma.product.delete({ where: { id } })
    return { success: true }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  Приватные утилиты
  // ══════════════════════════════════════════════════════════════════════════

  private async findCategoryById(id: number) {
    const cat = await this.prisma.category.findUnique({ where: { id } })
    if (!cat) throw new NotFoundException(`Категория #${id} не найдена`)
    return cat
  }

  private async ensureCategorySlugUnique(slug: string, excludeId?: number) {
    const existing = await this.prisma.category.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    })
    if (existing) throw new ConflictException(`Slug категории "${slug}" уже занят`)
  }

  private async ensureProductSlugUnique(slug: string, excludeId?: number) {
    const existing = await this.prisma.product.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    })
    if (existing) throw new ConflictException(`Slug товара "${slug}" уже занят`)
  }
}
