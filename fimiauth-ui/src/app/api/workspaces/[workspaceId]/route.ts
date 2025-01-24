import { db, workspace as workspaceTable } from "@/src/db/schema.js";
import { assertGetWorkspace } from "@/src/lib/serverHelpers/workspace.js";
import { wrapAuthenticated } from "@/src/lib/serverHelpers/wrapAuthenticated.js";
import { eq } from "drizzle-orm";

export const GET = wrapAuthenticated(async (req, res, { userId }) => {
  const workspaceId = req.nextUrl.pathname.split("/")[3];
  const workspace = await assertGetWorkspace(workspaceId);
  return workspace;
});

export const DELETE = wrapAuthenticated(async (req, res, { userId }) => {
  const workspaceId = req.nextUrl.pathname.split("/")[3];
  const workspace = await assertGetWorkspace(workspaceId);
  await db.delete(workspaceTable).where(eq(workspaceTable.id, workspaceId));
});
