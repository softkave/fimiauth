import { z } from "zod";
import { kAppConstants } from "./appConstants.js";
import { IResource } from "./resource.js";

export interface IWorkspace extends IResource {
  name: string;
  description?: string;
}

export const addWorkspaceSchema = z.object({
  name: z.string().min(1).max(kAppConstants.validation.maxNameLength),
  description: z
    .string()
    .max(kAppConstants.validation.maxDescriptionLength)
    .optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(kAppConstants.validation.maxNameLength)
    .optional(),
  description: z
    .string()
    .max(kAppConstants.validation.maxDescriptionLength)
    .optional(),
});

export const getWorkspaceByIdSchema = z.object({
  id: z.string().min(1),
});

export type IAddWorkspaceEndpointResponse = IWorkspace;
export type IUpdateWorkspaceEndpointResponse = IWorkspace;
export type IGetWorkspaceEndpointResponse = IWorkspace;
