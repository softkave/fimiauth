import { db } from "@/src/db/schema.js";
import { addPostSchema, postVisibilityEnum } from "@/src/definitions/post.js";
import { createPostCategoryMappings } from "@/src/lib/serverHelpers/postCategories.js";
import { wrapAuthenticated } from "@/src/lib/serverHelpers/wrapAuthenticated.js";
import { OmitFrom } from "softkave-js-utils";

export const POST = wrapAuthenticated(async (req, res, { userId }) => {
  const input = addPostSchema.parse(await req.json());
  const newPost = {
    title: input.title,
    content: input.content ?? "",
    summary: input.summary ?? "",
    visibility: input.visibility ?? postVisibilityEnum.Values.private,
    pinned: input.pinned ?? false,
    createdAt: new Date(),
    lastUpdatedAt: new Date(),
    createdBy: userId,
    lastUpdatedBy: userId,
  } satisfies OmitFrom<typeof postsTable.$inferInsert, "id">;

  const post = await db
    .insert(postsTable)
    .values([newPost])
    .returning()
    .then(([post]) => post);

  if (input.categories) {
    await createPostCategoryMappings({
      postId: post.id,
      categoryIds: input.categories,
      userId,
      visibility: input.visibility ?? postVisibilityEnum.Values.private,
    });
  }

  return post;
});
