-- CreateTable
CREATE TABLE "SeoSettings" (
    "id" SERIAL NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'Мой сайт',
    "defaultOgImage" TEXT,
    "titleTemplate" TEXT NOT NULL DEFAULT '%s | Мой сайт',
    "sitemapCache" TEXT,
    "sitemapBuiltAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Redirect" (
    "id" SERIAL NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL DEFAULT 301,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Redirect_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Redirect_from_key" ON "Redirect"("from");

-- CreateIndex
CREATE INDEX "Redirect_from_idx" ON "Redirect"("from");
