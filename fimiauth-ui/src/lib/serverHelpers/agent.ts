import { NextAuthRequest, auth } from "@/auth.js";
import { agent as agentTable, db } from "@/src/db/schema.js";
import { addAgentSchema } from "@/src/definitions/agent.js";
import { IActionSubject } from "@/src/definitions/resource.js";
import { kSpaceType } from "@/src/definitions/space.js";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { OwnServerError } from "../common/error.js";
import { tryGetCollaborator } from "./collaborator.js";
import { cleanSpaceInput } from "./space.js";
import { IRouteContext } from "./wrapRoute.js";

export async function tryGetAgentByProvidedId(params: {
  workspaceId: string;
  providedId: string;
  spaceId?: string;
}) {
  return await db
    .select()
    .from(agentTable)
    .where(
      and(
        eq(agentTable.workspaceId, params.workspaceId),
        eq(agentTable.providedId, params.providedId),
        ...(params.spaceId ? [eq(agentTable.spaceId, params.spaceId)] : [])
      )
    )
    .then(([agent]) => agent as typeof agentTable.$inferSelect | null);
}

export async function tryGetAgentById(params: {
  workspaceId: string;
  id: string;
}) {
  return await db
    .select()
    .from(agentTable)
    .where(
      and(
        eq(agentTable.workspaceId, params.workspaceId),
        eq(agentTable.id, params.id)
      )
    )
    .then(([agent]) => agent as typeof agentTable.$inferSelect | null);
}

export async function tryGetAgent(params: {
  workspaceId: string;
  id?: string;
  providedId?: string;
  spaceId?: string;
}) {
  if (params.id) {
    return await tryGetAgentById({
      workspaceId: params.workspaceId,
      id: params.id,
    });
  } else if (params.providedId) {
    return await tryGetAgentByProvidedId({
      workspaceId: params.workspaceId,
      providedId: params.providedId,
      spaceId: params.spaceId,
    });
  }

  return null;
}

export async function isAgentInSpace(params: {
  workspaceId: string;
  spaceId?: string;
  providedId?: string;
  id?: string;
}) {
  const agent = await tryGetAgent({
    workspaceId: params.workspaceId,
    spaceId: params.spaceId,
    providedId: params.providedId,
    id: params.id,
  });

  return (
    !!agent &&
    ((agent.spaceId === params.workspaceId &&
      agent.spaceType === kSpaceType.workspace) ||
      agent.spaceId === params.spaceId)
  );
}

export async function assertIsAgentInSpace(params: {
  workspaceId: string;
  spaceId?: string;
  providedId?: string;
  id?: string;
}) {
  const isAgent = await isAgentInSpace(params);
  if (!isAgent) {
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

export async function createAgent(params: {
  data: z.infer<typeof addAgentSchema> | (unknown & {});
  subject: IActionSubject;
}) {
  const input = addAgentSchema.parse(params.data);
  const newAgent = {
    ...input,
    ...cleanSpaceInput(input),
    createdAt: new Date(),
    lastUpdatedAt: new Date(),
    createdBy: params.subject.id,
    createdByType: params.subject.type,
    lastUpdatedBy: params.subject.id,
    lastUpdatedByType: params.subject.type,
  } satisfies typeof agentTable.$inferInsert;

  const agent = await db
    .insert(agentTable)
    .values([newAgent])
    .returning()
    .then(([agent]) => agent);

  return agent;
}
