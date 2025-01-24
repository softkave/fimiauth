import { db } from "@/src/db/schema.js";
import { addPostCategorySchema } from "@/src/definitions/post.js";
import { wrapAuthenticated } from "@/src/lib/serverHelpers/wrapAuthenticated.js";
import { OmitFrom } from "softkave-js-utils";

export const POST = wrapAuthenticated(async (req, res, { userId }) => {
  const input = addPostCategorySchema.parse(await req.json());
  const newCategory = {
    name: input.name,
    description: input.description ?? "",
    createdAt: new Date(),
    lastUpdatedAt: new Date(),
    createdBy: userId,
    lastUpdatedBy: userId,
  } satisfies OmitFrom<typeof postCategoriesTable.$inferInsert, "id">;

  const category = await db
    .insert(postCategoriesTable)
    .values([newCategory])
    .returning()
    .then(([category]) => category);

  return category;
});
