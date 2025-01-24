import { db } from "@/src/db/schema.js";
import { IUser } from "@/src/definitions/user.js";
import { OwnServerError } from "@/src/lib/common/error.js";
import { checkIsAdminEmail } from "@/src/lib/serverHelpers/isAdmin.js";
import { wrapAuthenticated } from "@/src/lib/serverHelpers/wrapAuthenticated.js";
import assert from "assert";
import { eq } from "drizzle-orm";

export const GET = wrapAuthenticated(async (req, ctx, user) => {
  const dbUser = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, user.userId))
    .then((users) => users[0]);

  assert(dbUser, new OwnServerError("User not found", 404));

  const isAdmin = checkIsAdminEmail(user.email);
  const userData: IUser = {
    isAdmin,
    id: dbUser.id,
    name: dbUser.name ?? "",
    email: dbUser.email ?? "",
    picture: dbUser.image ?? "",
  };

  return userData;
});
