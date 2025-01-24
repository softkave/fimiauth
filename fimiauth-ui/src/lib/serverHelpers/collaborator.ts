import { NextAuthRequest, auth } from "@/auth.js";
import { collaborator as collaboratorTable, db } from "@/src/db/schema.js";
import { and, eq } from "drizzle-orm";
import { OwnServerError } from "../common/error.js";
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
