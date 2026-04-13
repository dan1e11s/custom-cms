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
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Public } from '../../common/decorators/public.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
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
@Roles('ADMIN')
@Controller('admin/catalog')
export class CatalogAdminController {
  constructor(private readonly catalogService: CatalogService) {}

  // ── Категории ──────────────────────────────────────────────────────────────

  @Post('categories')
  @ApiOperation({ summary: 'Создать категорию' })
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.catalogService.createCategory(dto)
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Обновить категорию' })
  updateCategory(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.catalogService.updateCategory(id, dto)
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить категорию (без вложенных)' })
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.deleteCategory(id)
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
  createProduct(@Body() dto: CreateProductDto) {
    return this.catalogService.createProduct(dto)
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'Обновить товар' })
  updateProduct(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.catalogService.updateProduct(id, dto)
  }

  @Patch('products/:id/publish')
  @ApiOperation({ summary: 'Опубликовать товар' })
  publishProduct(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.publishProduct(id)
  }

  @Patch('products/:id/unpublish')
  @ApiOperation({ summary: 'Снять с публикации' })
  unpublishProduct(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.unpublishProduct(id)
  }

  @Delete('products/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить товар' })
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.deleteProduct(id)
  }
}
