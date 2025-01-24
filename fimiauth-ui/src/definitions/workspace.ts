import { z } from "zod";
import { IResource } from "./resource.js";

export interface IWorkspace extends IResource {
  name: string;
  description?: string;
}

export const addWorkspaceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export const getWorkspaceByIdSchema = z.object({
  id: z.string().min(1),
});

export type IAddWorkspaceEndpointResponse = IWorkspace;
export type IUpdateWorkspaceEndpointResponse = IWorkspace;
export type IGetWorkspaceEndpointResponse = IWorkspace;
