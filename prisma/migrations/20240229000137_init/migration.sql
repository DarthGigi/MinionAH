-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ALL', 'EMAIL', 'DEVICE', 'NONE');

-- CreateTable
CREATE TABLE "User" (
    "_id" TEXT NOT NULL,
    "loggedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "skin" TEXT NOT NULL,
    "cape" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "ProfileSettings" (
    "_id" TEXT NOT NULL,
    "email" TEXT,
    "bio" TEXT,
    "website" TEXT,

    CONSTRAINT "ProfileSettings_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "NotificationSettings" (
    "_id" TEXT NOT NULL,
    "notificationType" "NotificationType" NOT NULL,
    "marketNotifications" BOOLEAN NOT NULL DEFAULT true,
    "socialNotifications" BOOLEAN NOT NULL DEFAULT true,
    "fcmTokens" TEXT[],

    CONSTRAINT "NotificationSettings_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Session" (
    "_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Key" (
    "_id" TEXT NOT NULL,
    "hashed_password" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "Key_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Minion" (
    "_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "generator" TEXT NOT NULL,
    "generator_tier" INTEGER NOT NULL,
    "texture" TEXT NOT NULL,
    "skin" TEXT NOT NULL,
    "maxTier" INTEGER NOT NULL,
    "craftCost" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Minion_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Auction" (
    "_id" TEXT NOT NULL,
    "minion_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "hasInfusion" BOOLEAN NOT NULL DEFAULT false,
    "price" DOUBLE PRECISION NOT NULL,
    "amount" INTEGER,
    "timeCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Auction_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "_id" TEXT NOT NULL,
    "user1_id" TEXT NOT NULL,
    "user2_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user1Read" BOOLEAN NOT NULL DEFAULT false,
    "user2Read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Message" (
    "_id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_user_id_key" ON "UserSettings"("user_id");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Key_user_id_idx" ON "Key"("user_id");

-- CreateIndex
CREATE INDEX "Auction_user_id_idx" ON "Auction"("user_id");

-- CreateIndex
CREATE INDEX "Auction_minion_id_idx" ON "Auction"("minion_id");

-- CreateIndex
CREATE INDEX "Message_chat_id_idx" ON "Message"("chat_id");

-- CreateIndex
CREATE INDEX "Message_user_id_idx" ON "Message"("user_id");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings__id_fkey" FOREIGN KEY ("_id") REFERENCES "User"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileSettings" ADD CONSTRAINT "ProfileSettings__id_fkey" FOREIGN KEY ("_id") REFERENCES "UserSettings"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationSettings" ADD CONSTRAINT "NotificationSettings__id_fkey" FOREIGN KEY ("_id") REFERENCES "UserSettings"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Key" ADD CONSTRAINT "Key_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_minion_id_fkey" FOREIGN KEY ("minion_id") REFERENCES "Minion"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "User"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "User"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chat"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("_id") ON DELETE CASCADE ON UPDATE CASCADE;
