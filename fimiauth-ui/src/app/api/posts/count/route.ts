import { auth, NextAuthRequest } from "@/auth";
import { db } from "@/src/db/schema.js";
import {
  countPostsSchema,
  postVisibilityEnum,
  ICountPostsEndpointResponse,
} from "@/src/definitions/post.js";
import {
  getPostCategoriesByNames,
  getPostCategoryMappingsByCategoryIds,
} from "@/src/lib/serverHelpers/postCategories.js";
import { getUserByUsername } from "@/src/lib/serverHelpers/user.js";
import { wrapRoute } from "@/src/lib/serverHelpers/wrapRoute.js";
import assert from "assert";
import { and, count, eq, ilike, inArray, or } from "drizzle-orm";
import { isBoolean } from "lodash-es";

export const POST = wrapRoute(async (req: NextAuthRequest, ctx) => {
  const session = await auth(req, ctx);
  const sessionUserId = session?.user?.id;
  const input = countPostsSchema.parse(await req.json());
  let userId = input.userId || sessionUserId;

  assert.ok(userId || input.userName, "User is required");

  const search = input.search || "";
  const userName = input.userName || "";
  let categoryIds = input.categoryIds || [];
  const categoryNames = input.categoryNames || [];
  const visibility = sessionUserId
    ? input.visibility
    : postVisibilityEnum.Values.public;
  const pinned = input.pinned || false;

  if (!userId) {
    assert.ok(userName, "User name is required when user id is not provided");
    const user = await getUserByUsername(userName);
    userId = user?.id;
  }

  assert.ok(userId, "User is required");

  if (categoryNames.length > 0) {
    const categories = await getPostCategoriesByNames({ names: categoryNames });
    categoryIds = categories.map((category) => category.id);
  }

  let postIds: string[] = [];
  if (categoryIds.length > 0) {
    const mappings = await getPostCategoryMappingsByCategoryIds({
      categoryIds,
    });
    postIds = mappings.map((mapping) => mapping.postId);
  }

  const posts = await db
    .select({ count: count() })
    .from(postsTable)
    .where(
      and(
        eq(postsTable.createdBy, userId),
        or(
          visibility ? eq(postsTable.visibility, visibility) : undefined,
          isBoolean(pinned) ? eq(postsTable.pinned, pinned) : undefined,
          search ? ilike(postsTable.title, `%${search}%`) : undefined,
          postIds.length > 0 ? inArray(postsTable.id, postIds) : undefined
        )
      )
    );

  const response: ICountPostsEndpointResponse = {
    total: posts[0].count,
  };

  return response;
});
