import { db, workspace as workspaceTable } from "@/src/db/schema.js";
import { IActionSubject } from "@/src/definitions/resource.js";
import { addWorkspaceSchema } from "@/src/definitions/workspace.js";
import { eq, inArray } from "drizzle-orm";
import { OmitFrom } from "softkave-js-utils";
import { OwnServerError } from "../common/error.js";
import { getUserCollaboratorEntries } from "./collaborator.js";

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

export async function createWorkspace(params: {
  data: unknown;
  subject: IActionSubject;
}) {
  const input = addWorkspaceSchema.parse(params.data);
  const newWorkspace = {
    name: input.name,
    description: input.description ?? "",
    createdAt: new Date(),
    lastUpdatedAt: new Date(),
    createdBy: params.subject.id,
    lastUpdatedBy: params.subject.id,
    createdByType: params.subject.type,
    lastUpdatedByType: params.subject.type,
  } satisfies OmitFrom<typeof workspaceTable.$inferInsert, "id">;

  const workspace = await db
    .insert(workspaceTable)
    .values([newWorkspace])
    .returning()
    .then(([workspace]) => workspace);

  return workspace;
}

export async function getUserWorkspaces(params: { userId: string }) {
  const collaboratorEntries = await getUserCollaboratorEntries({
    userId: params.userId,
  });
  const workspaceIds = collaboratorEntries.map((entry) => entry.workspaceId);
  const workspaces = await db
    .select()
    .from(workspaceTable)
    .where(inArray(workspaceTable.id, workspaceIds));
  return workspaces;
}

export async function deleteWorkspace(params: { workspaceId: string }) {
  await db
    .delete(workspaceTable)
    .where(eq(workspaceTable.id, params.workspaceId));
}
