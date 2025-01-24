import { z } from "zod";
import { kAppConstants } from "./appConstants.js";
import { ISubSpaceResource } from "./space.js";

export interface IAgent extends ISubSpaceResource {
  providedId?: string;
  name?: string;
  description?: string;
  workspaceId: string;
}

export const addAgentSchema = z.object({
  name: z.string().min(1).max(kAppConstants.validation.maxNameLength),
  description: z
    .string()
    .max(kAppConstants.validation.maxDescriptionLength)
    .optional(),
  workspaceId: z.string().min(1),
  spaceId: z.string().min(1).optional(),
  providedId: z.string().min(1).optional(),
});

export const updateAgentSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(kAppConstants.validation.maxNameLength)
    .optional(),
  description: z
    .string()
    .max(kAppConstants.validation.maxDescriptionLength)
    .optional(),
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
