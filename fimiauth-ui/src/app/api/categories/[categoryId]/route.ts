import { auth } from "@/auth";
import { db } from "@/src/db/schema.js";
import {
  getPostCategorySchema,
  updatePostCategorySchema,
} from "@/src/definitions/post.js";
import { OwnServerError } from "@/src/lib/common/error.js";
import { isCategoryPublic } from "@/src/lib/serverHelpers/postCategories.js";
import { wrapAuthenticated } from "@/src/lib/serverHelpers/wrapAuthenticated.js";
import { wrapRoute } from "@/src/lib/serverHelpers/wrapRoute.js";
import assert from "assert";
import { and, eq } from "drizzle-orm";

export const GET = wrapRoute(async (req, ctx) => {
  const session = await auth(req, ctx);
  const sessionUserId = session?.user?.id;
  const params = ctx.params as { categoryId: string };
  const input = getPostCategorySchema.parse({
    categoryId: params.categoryId,
  });
  const category = await db
    .select()
    .from(postCategoriesTable)
    .where(eq(postCategoriesTable.id, input.categoryId))
    .then(([category]) => category);

  assert(category, new OwnServerError("Category not found", 404));

  const isPublic = await isCategoryPublic({ categoryId: input.categoryId });
  if (category.createdBy !== sessionUserId && !isPublic) {
    throw new OwnServerError("Category not found", 404);
  }

  return category;
});

export const DELETE = wrapAuthenticated(async (req, ctx, { userId }) => {
  const params = ctx.params as { categoryId: string };
  const input = getPostCategorySchema.parse({
    categoryId: params.categoryId,
  });

  await db
    .delete(postCategoriesTable)
    .where(
      and(
        eq(postCategoriesTable.id, input.categoryId),
        eq(postCategoriesTable.createdBy, userId)
      )
    );
});

export const PATCH = wrapAuthenticated(async (req, ctx, { userId }) => {
  const params = ctx.params as { categoryId: string };
  const categoryInput = getPostCategorySchema.parse({
    categoryId: params.categoryId,
  });
  const categoryUpdateInput = updatePostCategorySchema.parse(await req.json());

  let category = await db
    .update(postCategoriesTable)
    .set(categoryUpdateInput)
    .where(
      and(
        eq(postCategoriesTable.id, categoryInput.categoryId),
        eq(postCategoriesTable.createdBy, userId)
      )
    )
    .returning()
    .then(([category]) => category);

  assert(category, new OwnServerError("Category not found", 404));

  category = await db
    .update(postCategoriesTable)
    .set({
      ...categoryUpdateInput,
      lastUpdatedAt: new Date(),
      lastUpdatedBy: userId,
    })
    .where(eq(postCategoriesTable.id, categoryInput.categoryId))
    .returning()
    .then(([category]) => category);

  return category;
});
