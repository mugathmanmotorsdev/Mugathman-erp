-- AlterTable
ALTER TABLE "user_activation_tokens" ADD COLUMN     "expired_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
