/*
  Warnings:

  - You are about to drop the `Crop` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Crop";

-- CreateTable
CREATE TABLE "UserCrop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "investmentPerAcre" DOUBLE PRECISION NOT NULL,
    "revenuePerAcre" DOUBLE PRECISION NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "UserCrop_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserCrop" ADD CONSTRAINT "UserCrop_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
