import { z } from "zod";
import { kAppConstants } from "./appConstants.js";
import { ISubSpaceResource } from "./space.js";

export interface IPermissionGroup extends ISubSpaceResource {
  providedId?: string;
  name: string;
  description?: string;
  workspaceId: string;
}

export const addPermissionGroupSchema = z.object({
  name: z.string().min(1).max(kAppConstants.validation.maxNameLength),
  description: z
    .string()
    .max(kAppConstants.validation.maxDescriptionLength)
    .optional(),
  workspaceId: z.string().min(1),
  providedId: z.string().min(1).optional(),
  spaceId: z.string().min(1).optional(),
});

export const updatePermissionGroupSchema = z.object({
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

export const getPermissionGroupSchema = z.object({
  id: z.string().min(1).optional(),
  workspaceId: z.string().min(1).optional(),
  providedId: z.string().min(1).optional(),
  spaceId: z.string().min(1).optional(),
});

export const getPermissionGroupsSchema = z.object({
  workspaceId: z.string().min(1),
  spaceId: z.string().min(1).optional(),
  agentId: z.string().min(1).optional(),
  permissionGroupId: z.string().min(1).optional(),
});

export type IAddPermissionGroupEndpointResponse = IPermissionGroup;
export type IUpdatePermissionGroupEndpointResponse = IPermissionGroup;
export type IGetPermissionGroupEndpointResponse = IPermissionGroup;
export type IGetPermissionsGroupEndpointResponse = IPermissionGroup[];
