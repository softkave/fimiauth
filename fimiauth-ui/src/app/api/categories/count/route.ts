import { auth, NextAuthRequest } from "@/auth";
import { db } from "@/src/db/schema.js";
import {
  countPostCategoriesSchema,
  postVisibilityEnum,
  ICountPostCategoriesEndpointResponse,
} from "@/src/definitions/post.js";
import { getPostCategoryMappingsByVisibility } from "@/src/lib/serverHelpers/postCategories.js";
import { getUserByUsername } from "@/src/lib/serverHelpers/user.js";
import { wrapRoute } from "@/src/lib/serverHelpers/wrapRoute.js";
import assert from "assert";
import { and, count, eq, ilike, inArray, or } from "drizzle-orm";

export const POST = wrapRoute(async (req: NextAuthRequest, ctx) => {
  const session = await auth(req, ctx);
  const sessionUserId = session?.user?.id;
  const input = countPostCategoriesSchema.parse(await req.json());
  let userId = input.userId || sessionUserId;

  assert.ok(userId || input.userName, "User is required");

  const search = input.search || "";
  const userName = input.userName || "";

  if (!userId) {
    assert.ok(userName, "User name is required when user id is not provided");
    const user = await getUserByUsername(userName);
    userId = user?.id;
  }

  assert.ok(userId, "User is required");

  // if the requester is requesting own categories, then respect the visibility,
  // otherwise return public categories
  const visibility =
    sessionUserId === userId
      ? input.visibility
      : postVisibilityEnum.Values.public;

  let categoryIds: string[] | undefined;
  if (visibility) {
    const mappings = await getPostCategoryMappingsByVisibility({
      visibility,
    });
    categoryIds = mappings.map((mapping) => mapping.categoryId);
  }

  const posts = await db
    .select({ count: count() })
    .from(postCategoriesTable)
    .where(
      and(
        eq(postCategoriesTable.createdBy, userId),
        or(
          search ? ilike(postCategoriesTable.name, `%${search}%`) : undefined,
          categoryIds ? inArray(postCategoriesTable.id, categoryIds) : undefined
        )
      )
    );

  const response: ICountPostCategoriesEndpointResponse = {
    total: posts[0].count,
  };

  return response;
});
