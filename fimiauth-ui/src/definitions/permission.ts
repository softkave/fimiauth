import { ValueOf } from "type-fest";
import { z } from "zod";
import { ISubSpaceResource } from "./space.js";
import { kAppConstants } from "./appConstants.js";

export const kEntityType = {
  agent: "agent",
  permissionGroup: "pg",
  external: "ext",
} as const;

export const kTargetType = {
  agent: "agent",
  permissionGroup: "pg",
  workspace: "wkspace",
  collaborator: "collab",
  collaborationRequest: "collabReq",
  space: "space",
  external: "ext",
} as const;

export type IPermissionEntityType = ValueOf<typeof kEntityType> | (string & {});
export type IPermissionTargetType = ValueOf<typeof kTargetType> | (string & {});

export interface IPermission extends ISubSpaceResource {
  description?: string;
  entityId: string;
  entityType: IPermissionEntityType;
  action: string;
  access: boolean;
  target: string;
  targetType: IPermissionTargetType;
  workspaceId: string;
}

export const addPermissionSchema = z.object({
  description: z
    .string()
    .max(kAppConstants.validation.maxDescriptionLength)
    .optional(),
  entityId: z.string().min(1),
  entityType: z.nativeEnum(kEntityType).optional(),
  action: z.string().min(1),
  access: z.boolean(),
  target: z.string().min(1),
  targetType: z.nativeEnum(kTargetType).optional(),
  workspaceId: z.string().min(1),
  spaceId: z.string().min(1).optional(),
});

export const removePermissionSchema = z.object({
  entityId: z.string().min(1).optional(),
  entityType: z.nativeEnum(kEntityType).optional(),
  action: z.string().min(1).optional(),
  access: z.boolean().optional(),
  target: z.string().min(1).optional(),
  targetType: z.nativeEnum(kTargetType).optional(),
  spaceId: z.string().min(1).optional(),
});

export const resolvePermissionSchema = z.object({
  entityId: z.string().min(1),
  entityType: z.nativeEnum(kEntityType).optional(),
  target: z.string().min(1),
  targetType: z.nativeEnum(kTargetType).optional(),
  action: z.string().min(1),
  access: z.boolean().optional(),
  spaceId: z.string().min(1).optional(),
});

export const bulkResolvePermissionSchema = z.object({
  permissions: z.array(resolvePermissionSchema),
});

export interface IResolvePermissionEndpointResponse {
  access: boolean;
}

export type IBulkResolvePermissionEndpointResponse =
  IResolvePermissionEndpointResponse[];
