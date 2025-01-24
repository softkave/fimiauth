import { ValueOf } from "type-fest";
import { z } from "zod";
import { IAgent } from "./agent.js";
import { ISubSpaceResource } from "./space.js";

export const kCollaboratorType = {
  user: "usr",
  external: "ext",
} as const;

export type CollaboratorType = ValueOf<typeof kCollaboratorType>;

export interface ICollaborator extends ISubSpaceResource {
  id: string;
  providedId: string;
  type: CollaboratorType;
  workspaceId: string;
  createdAt: number;
  lastUpdatedAt: number;
  lastUpdatedBy: string;
  createdBy: string;
}

export const addCollaboratorSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  workspaceId: z.string().min(1),
  providedId: z.string().min(1),
  spaceId: z.string().min(1).optional(),
});

export const updateAgentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  spaceId: z.string().min(1).optional(),
  providedId: z.string().min(1).optional(),
});

export const getCollaboratorSchema = z.object({
  id: z.string().min(1).optional(),
  workspaceId: z.string().min(1).optional(),
  providedId: z.string().min(1).optional(),
  spaceId: z.string().min(1).optional(),
});

export const getAgentsSchema = z.object({
  workspaceId: z.string().min(1),
  spaceId: z.string().min(1).optional(),
});

export type IAddAgentEndpointResponse = IAgent;
export type IUpdateAgentEndpointResponse = IAgent;
export type IGetAgentEndpointResponse = IAgent;
export type IGetAgentsEndpointResponse = IAgent[];
