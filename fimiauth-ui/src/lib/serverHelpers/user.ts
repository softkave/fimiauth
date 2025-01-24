import { db, users } from "@/src/db/schema.js";
import { eq } from "drizzle-orm";

export async function getUserByUsername(username: string) {
  return db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .then((result) => result[0]);
}
