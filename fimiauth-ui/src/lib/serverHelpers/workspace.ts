import { db, workspace as workspaceTable } from "@/src/db/schema.js";
import { kEavEntityType } from "@/src/definitions/eav.js";
import { IActionSubject } from "@/src/definitions/resource.js";
import {
  addWorkspaceSchema,
  updateWorkspaceSchema,
} from "@/src/definitions/workspace.js";
import { eq, inArray } from "drizzle-orm";
import { OmitFrom } from "softkave-js-utils";
import { z } from "zod";
import { OwnServerError } from "../common/error.js";
import { createAgent } from "./agent.js";
import { getUserCollaboratorEntries } from "./collaborator.js";
import {
  assignPermissionGroup,
  createAdminPermissionGroup,
} from "./permissionGroup.js";

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
  data: z.infer<typeof addWorkspaceSchema> | (unknown & {});
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

  const [adminPermissionGroup, agent] = await Promise.all([
    createAdminPermissionGroup({
      workspaceId: workspace.id,
      subject: params.subject,
    }),
    createAgent({
      data: {
        name: `default agent for user - ${params.subject.id}`,
        workspaceId: workspace.id,
        providedId: params.subject.id,
      },
      subject: params.subject,
    }),
  ]);

  await assignPermissionGroup({
    pgId: adminPermissionGroup.id,
    entityId: agent.id,
    entityType: kEavEntityType.agent,
    subject: params.subject,
    workspaceId: workspace.id,
  });

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

export async function updateWorkspace(params: {
  data: z.infer<typeof updateWorkspaceSchema> | (unknown & {});
  workspaceId: string;
  subject: IActionSubject;
}) {
  const input = updateWorkspaceSchema.parse(params.data);

  const workspace = await db
    .update(workspaceTable)
    .set({
      ...input,
      lastUpdatedAt: new Date(),
      lastUpdatedBy: params.subject.id,
      lastUpdatedByType: params.subject.type,
    })
    .where(eq(workspaceTable.id, params.workspaceId))
    .returning()
    .then(
      ([workspace]) => workspace as typeof workspaceTable.$inferSelect | null
    );

  return workspace;
}
