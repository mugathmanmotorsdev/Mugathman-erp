/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `user_activation_tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user_activation_tokens_token_key" ON "user_activation_tokens"("token");
