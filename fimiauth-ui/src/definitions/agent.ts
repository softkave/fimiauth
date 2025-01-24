import { z } from "zod";
import { ISubSpaceResource } from "./space.js";

export interface IAgent extends ISubSpaceResource {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  createdAt: number;
  lastUpdatedAt: number;
  lastUpdatedBy: string;
  createdBy: string;
}

export const addAgentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  workspaceId: z.string().min(1),
  spaceId: z.string().min(1).optional(),
});

export const updateAgentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  spaceId: z.string().min(1).optional(),
});

export const getAgentByIdSchema = z.object({
  id: z.string().min(1),
});

export const getAgentsSchema = z.object({
  workspaceId: z.string().min(1),
  spaceId: z.string().min(1).optional(),
});

export type IAddAgentEndpointResponse = IAgent;
export type IUpdateAgentEndpointResponse = IAgent;
export type IGetAgentEndpointResponse = IAgent;
export type IGetAgentsEndpointResponse = IAgent[];
