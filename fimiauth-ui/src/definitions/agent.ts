import { z } from "zod";
import { ISubSpaceResource } from "./space.js";

export interface IAgent extends ISubSpaceResource {
  providedId?: string;
  name: string;
  description?: string;
  workspaceId: string;
}

export const addAgentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  workspaceId: z.string().min(1),
  spaceId: z.string().min(1).optional(),
  providedId: z.string().min(1).optional(),
});

export const updateAgentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  spaceId: z.string().min(1).optional(),
  providedId: z.string().min(1).optional(),
});

export const getAgentSchema = z.object({
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
