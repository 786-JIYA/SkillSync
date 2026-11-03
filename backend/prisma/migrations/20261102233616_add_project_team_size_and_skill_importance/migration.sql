/*
  Warnings:

  - The values [LOW,MEDIUM,HIGH,CRITICAL] on the enum `SkillImportance` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `preferred_team_size` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SkillImportance_new" AS ENUM ('REQUIRED', 'NICE_TO_HAVE');
ALTER TABLE "public"."project_required_skills" ALTER COLUMN "importance" DROP DEFAULT;
ALTER TABLE "project_required_skills" ALTER COLUMN "importance" TYPE "SkillImportance_new" USING ("importance"::text::"SkillImportance_new");
ALTER TYPE "SkillImportance" RENAME TO "SkillImportance_old";
ALTER TYPE "SkillImportance_new" RENAME TO "SkillImportance";
DROP TYPE "public"."SkillImportance_old";
ALTER TABLE "project_required_skills" ALTER COLUMN "importance" SET DEFAULT 'NICE_TO_HAVE';
COMMIT;

-- AlterTable
ALTER TABLE "project_required_skills" ALTER COLUMN "importance" SET DEFAULT 'NICE_TO_HAVE';

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "preferred_team_size" INTEGER NOT NULL;
