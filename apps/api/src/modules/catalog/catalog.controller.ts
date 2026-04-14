import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Public } from '../../common/decorators/public.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { RevalidationService } from '../../common/revalidation/revalidation.service'
import { CatalogService } from './catalog.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { CreateProductDto } from './dto/create-product.dto'
import { FilterProductsDto } from './dto/filter-products.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { UpdateProductDto } from './dto/update-product.dto'

// ── Публичные эндпоинты ───────────────────────────────────────────────────────

@ApiTags('Catalog (Public)')
@Public()
@Controller('catalog')
export class CatalogPublicController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('categories/tree')
  @ApiOperation({ summary: 'Дерево категорий каталога' })
  getCategoryTree() {
    return this.catalogService.getCategoryTree()
  }

  @Get('categories/:slug')
  @ApiOperation({ summary: 'Категория по slug' })
  getCategoryBySlug(@Param('slug') slug: string) {
    return this.catalogService.getCategoryBySlug(slug)
  }

  @Get('products')
  @ApiOperation({ summary: 'Список опубликованных товаров (с фильтрацией)' })
  findProducts(@Query() dto: FilterProductsDto) {
    return this.catalogService.findProducts(dto)
  }

  @Get('products/:slug')
  @ApiOperation({ summary: 'Товар по slug' })
  findProductBySlug(@Param('slug') slug: string) {
    return this.catalogService.findProductBySlug(slug)
  }

  @Get('products/:slug/related')
  @ApiOperation({ summary: 'Похожие товары (из той же категории)' })
  findRelated(@Param('slug') slug: string) {
    return this.catalogService.findRelated(slug)
  }
}

// ── Admin эндпоинты ───────────────────────────────────────────────────────────

@ApiTags('Catalog (Admin)')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin/catalog')
export class CatalogAdminController {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly revalidation: RevalidationService,
  ) {}

  // ── Категории ──────────────────────────────────────────────────────────────

  @Post('categories')
  @ApiOperation({ summary: 'Создать категорию' })
  async createCategory(@Body() dto: CreateCategoryDto) {
    const result = await this.catalogService.createCategory(dto)
    this.revalidation.revalidate('catalog').catch(() => {})
    return result
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Обновить категорию' })
  async updateCategory(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    const result = await this.catalogService.updateCategory(id, dto)
    this.revalidation.revalidate('catalog').catch(() => {})
    return result
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить категорию (без вложенных)' })
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    const result = await this.catalogService.deleteCategory(id)
    this.revalidation.revalidate('catalog').catch(() => {})
    return result
  }

  // ── Товары ─────────────────────────────────────────────────────────────────

  @Get('products')
  @ApiOperation({ summary: 'Все товары (все статусы, с фильтрацией)' })
  findAllProducts(@Query() dto: FilterProductsDto) {
    return this.catalogService.findAllProducts(dto)
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Товар по ID (admin)' })
  findProductById(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.findProductById(id)
  }

  @Post('products')
  @ApiOperation({ summary: 'Создать товар' })
  async createProduct(@Body() dto: CreateProductDto) {
    const result = await this.catalogService.createProduct(dto)
    this.revalidation.revalidateAll(['catalog', `product-${result.slug}`])
    return result
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'Обновить товар' })
  async updateProduct(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    const result = await this.catalogService.updateProduct(id, dto)
    this.revalidation.revalidateAll(['catalog', `product-${result.slug}`])
    return result
  }

  @Patch('products/:id/publish')
  @ApiOperation({ summary: 'Опубликовать товар' })
  async publishProduct(@Param('id', ParseIntPipe) id: number) {
    const result = await this.catalogService.publishProduct(id)
    this.revalidation.revalidateAll(['catalog', `product-${result.slug}`])
    return result
  }

  @Patch('products/:id/unpublish')
  @ApiOperation({ summary: 'Снять с публикации' })
  async unpublishProduct(@Param('id', ParseIntPipe) id: number) {
    const result = await this.catalogService.unpublishProduct(id)
    this.revalidation.revalidateAll(['catalog', `product-${result.slug}`])
    return result
  }

  @Delete('products/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить товар' })
  async deleteProduct(@Param('id', ParseIntPipe) id: number) {
    const result = await this.catalogService.deleteProduct(id)
    this.revalidation.revalidate('catalog').catch(() => {})
    return result
  }
}
