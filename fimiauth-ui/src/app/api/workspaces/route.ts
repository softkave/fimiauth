import { db, workspace as workspaceTable } from "@/src/db/schema.js";
import { addWorkspaceSchema } from "@/src/definitions/workspace.js";
import { wrapAuthenticated } from "@/src/lib/serverHelpers/wrapAuthenticated.js";
import { OmitFrom } from "softkave-js-utils";

export const POST = wrapAuthenticated(async (req, res, { userId }) => {
  const input = addWorkspaceSchema.parse(await req.json());
  const newWorkspace = {
    name: input.name,
    description: input.description ?? "",
    createdAt: new Date(),
    lastUpdatedAt: new Date(),
    createdBy: userId,
    lastUpdatedBy: userId,
  } satisfies OmitFrom<typeof workspaceTable.$inferInsert, "id">;

  const workspace = await db
    .insert(workspaceTable)
    .values([newWorkspace])
    .returning()
    .then(([workspace]) => workspace);

  return workspace;
});
