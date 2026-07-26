-- Authentication matches usernames and emails case-insensitively, so enforce
-- the same uniqueness contract at the database level.
CREATE UNIQUE INDEX "User_username_ci_key" ON "User"(LOWER("username"));
CREATE UNIQUE INDEX "User_email_ci_key" ON "User"(LOWER("email")) WHERE "email" IS NOT NULL;
