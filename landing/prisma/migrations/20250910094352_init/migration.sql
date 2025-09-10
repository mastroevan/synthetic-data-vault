-- CreateTable
CREATE TABLE "public"."DatasetTemplate" (
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "schemaJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "DatasetTemplate_pkey" PRIMARY KEY ("templateId")
);
