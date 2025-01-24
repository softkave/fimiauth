import { auth } from "@/auth";
import { db } from "@/src/db/schema.js";
import {
  getPostSchema,
  postVisibilityEnum,
  updatePostSchema,
  PostVisibility,
} from "@/src/definitions/post.js";
import { OwnServerError } from "@/src/lib/common/error.js";
import { syncPostCategories } from "@/src/lib/serverHelpers/postCategories.js";
import { wrapAuthenticated } from "@/src/lib/serverHelpers/wrapAuthenticated.js";
import { wrapRoute } from "@/src/lib/serverHelpers/wrapRoute.js";
import assert from "assert";
import { and, eq } from "drizzle-orm";

export const GET = wrapRoute(async (req, ctx) => {
  const session = await auth(req, ctx);
  const sessionUserId = session?.user?.id;
  const params = ctx.params as { postId: string };
  const input = getPostSchema.parse({
    postId: params.postId,
  });
  const post = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.id, input.postId))
    .then(([post]) => post);

  assert(post, new OwnServerError("Post not found", 404));

  if (
    post.visibility === postVisibilityEnum.Values.private &&
    post.createdBy !== sessionUserId
  ) {
    throw new OwnServerError("Post not found", 404);
  }

  return post;
});

export const DELETE = wrapAuthenticated(async (req, ctx, { userId }) => {
  const params = ctx.params as { postId: string };
  const input = getPostSchema.parse({
    postId: params.postId,
  });

  await db
    .delete(postsTable)
    .where(
      and(eq(postsTable.id, input.postId), eq(postsTable.createdBy, userId))
    );
});

export const PATCH = wrapAuthenticated(async (req, ctx, { userId }) => {
  const params = ctx.params as { postId: string };
  const postInput = getPostSchema.parse({
    postId: params.postId,
  });
  const postUpdateInput = updatePostSchema.parse(await req.json());

  let post = await db
    .update(postsTable)
    .set(postUpdateInput)
    .where(
      and(eq(postsTable.id, postInput.postId), eq(postsTable.createdBy, userId))
    )
    .returning()
    .then(([post]) => post);

  assert(post, new OwnServerError("Post not found", 404));

  post = await db
    .update(postsTable)
    .set({
      ...postUpdateInput,
      lastUpdatedAt: new Date(),
      lastUpdatedBy: userId,
    })
    .where(eq(postsTable.id, postInput.postId))
    .returning()
    .then(([post]) => post);

  if (postUpdateInput.categories) {
    await syncPostCategories({
      postId: post.id,
      categoryIds: postUpdateInput.categories,
      userId,
      visibility:
        postUpdateInput.visibility ?? (post.visibility as PostVisibility),
    });
  }

  return post;
});
