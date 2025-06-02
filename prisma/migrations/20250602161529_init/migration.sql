/*
  Warnings:

  - The primary key for the `Member` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Member` table. All the data in the column will be lost.
  - The `id` column on the `Member` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `position` on table `Member` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `Member` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Member_email_key";

-- AlterTable
ALTER TABLE "Member" DROP CONSTRAINT "Member_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "position" SET NOT NULL,
ALTER COLUMN "address" SET NOT NULL,
ADD CONSTRAINT "Member_pkey" PRIMARY KEY ("id");
