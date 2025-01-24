import { db, workspace as workspaceTable } from "@/src/db/schema.js";
import { eq } from "drizzle-orm";
import { OwnServerError } from "../common/error.js";

export const getWorkspace = async (params: { workspaceId: string }) => {
  const workspace = await db
    .select()
    .from(workspaceTable)
    .where(eq(workspaceTable.id, params.workspaceId));
  return workspace;
};

export const assertGetWorkspace = async (params: { workspaceId: string }) => {
  const workspace = await getWorkspace(params);
  if (!workspace) {
    throw new OwnServerError("Workspace not found", 404);
  }
  return workspace;
};
