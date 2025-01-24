import { auth, NextAuthRequest } from "@/auth.js";
import { collaborator as collaboratorTable, db } from "@/src/db/schema.js";
import {
  addCollaboratorSchema,
  CollaboratorType,
} from "@/src/definitions/collaborator.js";
import { IActionSubject } from "@/src/definitions/resource.js";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { OwnServerError } from "../common/error.js";
import { cleanSpaceInput } from "./space.js";
import { IRouteContext } from "./wrapRoute.js";

export async function tryGetCollaborator(params: {
  workspaceId: string;
  providedId: string;
}) {
  return await db
    .select()
    .from(collaboratorTable)
    .where(
      and(
        eq(collaboratorTable.workspaceId, params.workspaceId),
        eq(collaboratorTable.providedId, params.providedId)
      )
    )
    .then(
      ([collaborator]) =>
        collaborator as typeof collaboratorTable.$inferSelect | null
    );
}

export async function isCollaboratorInSpace(params: {
  spaceId: string;
  providedId: string;
}) {
  const collaborator = await db
    .select({
      id: collaboratorTable.id,
    })
    .from(collaboratorTable)
    .where(
      and(
        eq(collaboratorTable.spaceId, params.spaceId),
        eq(collaboratorTable.providedId, params.providedId)
      )
    )
    .then(([collaborator]) => collaborator || null);
  return !!collaborator;
}

export async function assertIsCollaboratorInSpace(params: {
  spaceId: string;
  providedId: string;
}) {
  const isCollaborator = await isCollaboratorInSpace(params);
  if (!isCollaborator) {
    throw new OwnServerError("Permission denied", 403);
  }
}

export async function isCollaboratorInWorkspace(params: {
  workspaceId: string;
  providedId: string;
}) {
  const collaborator = await db
    .select({
      id: collaboratorTable.id,
    })
    .from(collaboratorTable)
    .where(
      and(
        eq(collaboratorTable.workspaceId, params.workspaceId),
        eq(collaboratorTable.providedId, params.providedId)
      )
    )
    .then(([collaborator]) => collaborator || null);
  return !!collaborator;
}

export async function assertIsCollaboratorInWorkspace(params: {
  workspaceId: string;
  providedId: string;
}) {
  const isCollaborator = await isCollaboratorInWorkspace(params);
  if (!isCollaborator) {
    throw new OwnServerError("Permission denied", 403);
  }
}

export async function tryGetCollaboratorFromRequest(params: {
  request: NextAuthRequest;
  ctx: IRouteContext;
  workspaceId: string;
}) {
  const session = await auth(params.request, params.ctx);
  const sessionUserId = session?.user?.id;

  if (!sessionUserId) {
    return null;
  }

  const collaborator = await tryGetCollaborator({
    workspaceId: params.workspaceId,
    providedId: sessionUserId,
  });

  return collaborator;
}

export async function getUserCollaboratorEntries(params: { userId: string }) {
  const collaboratorEntries = await db
    .select()
    .from(collaboratorTable)
    .where(eq(collaboratorTable.providedId, params.userId));
  return collaboratorEntries;
}

export async function createCollaboratorEntry(params: {
  data: z.infer<typeof addCollaboratorSchema> | (unknown & {});
  subject: IActionSubject;
  type: CollaboratorType;
  workspaceId: string;
}) {
  const input = addCollaboratorSchema.parse(params.data);
  const newCollaborator = {
    workspaceId: input.workspaceId,
    providedId: input.providedId,
    createdAt: new Date(),
    lastUpdatedAt: new Date(),
    createdBy: params.subject.id,
    createdByType: params.subject.type,
    lastUpdatedBy: params.subject.id,
    lastUpdatedByType: params.subject.type,
    type: params.type,
    ...cleanSpaceInput(input),
  } satisfies typeof collaboratorTable.$inferInsert;

  const collaborator = await db
    .insert(collaboratorTable)
    .values(newCollaborator);

  return collaborator;
}
