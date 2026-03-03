/*
  Warnings:

  - You are about to drop the column `status` on the `Agent` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Agent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "capabilities" TEXT,
    "systemPrompt" TEXT,
    "modelProvider" TEXT DEFAULT 'ollama-local',
    "modelName" TEXT DEFAULT 'llama2',
    "apiEndpoint" TEXT,
    "endpoint" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Agent_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Agent" ("capabilities", "createdAt", "description", "endpoint", "id", "name", "ownerId", "systemPrompt", "updatedAt") SELECT "capabilities", "createdAt", "description", "endpoint", "id", "name", "ownerId", "systemPrompt", "updatedAt" FROM "Agent";
DROP TABLE "Agent";
ALTER TABLE "new_Agent" RENAME TO "Agent";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
