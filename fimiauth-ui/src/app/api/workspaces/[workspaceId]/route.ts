import { db, workspace as workspaceTable } from "@/src/db/schema.js";
import { getWorkspaceByIdSchema } from "@/src/definitions/workspace.js";
import { assertGetWorkspace } from "@/src/lib/serverHelpers/workspace.js";
import { wrapAuthenticated } from "@/src/lib/serverHelpers/wrapAuthenticated.js";
import { eq } from "drizzle-orm";

export const GET = wrapAuthenticated(async (req, ctx, { userId }) => {
  const params = ctx.params as { workspaceId: string };
  const input = getWorkspaceByIdSchema.parse({
    workspaceId: params.workspaceId,
  });
  const workspace = await assertGetWorkspace(input.id);
  return workspace;
});

export const DELETE = wrapAuthenticated(async (req, ctx, { userId }) => {
  const params = ctx.params as { workspaceId: string };
  const input = getWorkspaceByIdSchema.parse({
    workspaceId: params.workspaceId,
  });
  const workspace = await assertGetWorkspace(input.id);
  await db.delete(workspaceTable).where(eq(workspaceTable.id, input.id));
});
