import { z } from "zod";
import { ISubSpaceResource } from "./space.js";

export interface IPermissionGroup extends ISubSpaceResource {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  createdAt: number;
  lastUpdatedAt: number;
  lastUpdatedBy: string;
  createdBy: string;
}

export const addPermissionGroupSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  workspaceId: z.string().min(1),
  spaceId: z.string().min(1).optional(),
});

export const updatePermissionGroupSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  spaceId: z.string().min(1).optional(),
});

export const getPermissionByIdGroupSchema = z.object({
  id: z.string().min(1),
});

export const getPermissionsGroupSchema = z.object({
  workspaceId: z.string().min(1),
  spaceId: z.string().min(1).optional(),
});

export type IAddPermissionGroupEndpointResponse = IPermissionGroup;
export type IUpdatePermissionGroupEndpointResponse = IPermissionGroup;
export type IGetPermissionGroupEndpointResponse = IPermissionGroup;
export type IGetPermissionsGroupEndpointResponse = IPermissionGroup[];
