import { auth, NextAuthRequest } from "@/auth";
import { db } from "@/src/db/schema.js";
import {
  getPostsSchema,
  postSortByEnum,
  postSortOrderEnum,
  postVisibilityEnum,
  IGetPostsEndpointResponse,
  IPost,
} from "@/src/definitions/post.js";
import {
  getPostCategoriesByNames,
  getPostCategoryMappingsByCategoryIds,
} from "@/src/lib/serverHelpers/postCategories.js";
import { getUserByUsername } from "@/src/lib/serverHelpers/user.js";
import { wrapRoute } from "@/src/lib/serverHelpers/wrapRoute.js";
import assert from "assert";
import { and, asc, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { isBoolean } from "lodash-es";

export const POST = wrapRoute(async (req: NextAuthRequest, ctx) => {
  const session = await auth(req, ctx);
  const sessionUserId = session?.user?.id;
  const input = getPostsSchema.parse(await req.json());
  let userId = input.userId || sessionUserId;

  assert.ok(userId || input.userName, "User is required");

  const page = input.page || 1;
  const pageSize = input.pageSize || 10;
  const sortBy = input.sortBy || postSortByEnum.Values.createdAt;
  const sortOrder = input.sortOrder || postSortOrderEnum.Values.desc;
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

  const sortOrderFn = sortOrder === "desc" ? desc : asc;
  const posts = await db
    .select()
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
    )
    .orderBy(sortOrderFn(postsTable[sortBy]))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const response: IGetPostsEndpointResponse = {
    posts: posts as unknown as IPost[],
  };

  return response;
});
