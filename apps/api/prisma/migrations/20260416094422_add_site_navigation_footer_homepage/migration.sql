-- CreateEnum
CREATE TYPE "NavItemType" AS ENUM ('PAGE', 'CATALOG', 'BLOG', 'FORUM', 'GRAM', 'EXTERNAL', 'DROPDOWN');

-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "isHomePage" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SeoSettings" ADD COLUMN     "footerCopyright" TEXT,
ADD COLUMN     "logoText" TEXT,
ADD COLUMN     "logoUrl" TEXT;

-- CreateTable
CREATE TABLE "NavItem" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "type" "NavItemType" NOT NULL DEFAULT 'PAGE',
    "href" TEXT,
    "icon" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "parentId" INTEGER,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "openInNewTab" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NavItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterColumn" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FooterColumn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterLink" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "columnId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "openInNewTab" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FooterLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NavItem_parentId_order_idx" ON "NavItem"("parentId", "order");

-- CreateIndex
CREATE INDEX "Page_isHomePage_idx" ON "Page"("isHomePage");

-- AddForeignKey
ALTER TABLE "NavItem" ADD CONSTRAINT "NavItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "NavItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FooterLink" ADD CONSTRAINT "FooterLink_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "FooterColumn"("id") ON DELETE CASCADE ON UPDATE CASCADE;
