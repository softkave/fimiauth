import { auth, NextAuthRequest } from "@/auth";
import { db } from "@/src/db/schema.js";
import {
  getPostCategoriesSchema,
  postSortByEnum,
  postSortOrderEnum,
  postVisibilityEnum,
  IGetPostCategoriesEndpointResponse,
  IPostCategory,
} from "@/src/definitions/post.js";
import { getPostCategoryMappingsByVisibility } from "@/src/lib/serverHelpers/postCategories.js";
import { getUserByUsername } from "@/src/lib/serverHelpers/user.js";
import { wrapRoute } from "@/src/lib/serverHelpers/wrapRoute.js";
import assert from "assert";
import { and, asc, desc, eq, ilike, inArray, or } from "drizzle-orm";

export const POST = wrapRoute(async (req: NextAuthRequest, ctx) => {
  const session = await auth(req, ctx);
  const sessionUserId = session?.user?.id;
  const input = getPostCategoriesSchema.parse(await req.json());
  let userId = input.userId || sessionUserId;

  assert.ok(userId || input.userName, "User is required");

  const page = input.page || 1;
  const pageSize = input.pageSize || 10;
  const sortBy = input.sortBy || postSortByEnum.Values.createdAt;
  const sortOrder = input.sortOrder || postSortOrderEnum.Values.desc;
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

  const sortOrderFn = sortOrder === "desc" ? desc : asc;
  const posts = await db
    .select()
    .from(postCategoriesTable)
    .where(
      and(
        eq(postCategoriesTable.createdBy, userId),
        or(
          search ? ilike(postCategoriesTable.name, `%${search}%`) : undefined,
          categoryIds ? inArray(postCategoriesTable.id, categoryIds) : undefined
        )
      )
    )
    .orderBy(sortOrderFn(postCategoriesTable[sortBy]))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const response: IGetPostCategoriesEndpointResponse = {
    categories: posts as unknown as IPostCategory[],
  };

  return response;
});
