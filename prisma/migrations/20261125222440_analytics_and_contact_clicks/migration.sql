-- CreateTable
CREATE TABLE "PageViewDaily" (
    "day" DATE NOT NULL,
    "path" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PageViewDaily_pkey" PRIMARY KEY ("day","path")
);

-- CreateTable
CREATE TABLE "VisitorDaily" (
    "day" DATE NOT NULL,
    "hash" TEXT NOT NULL,

    CONSTRAINT "VisitorDaily_pkey" PRIMARY KEY ("day","hash")
);

-- CreateTable
CREATE TABLE "ContactClick" (
    "id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "page" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactClick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageViewDaily_day_idx" ON "PageViewDaily"("day");

-- CreateIndex
CREATE INDEX "ContactClick_createdAt_idx" ON "ContactClick"("createdAt");
