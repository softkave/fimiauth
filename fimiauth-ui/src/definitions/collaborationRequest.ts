import { pick } from "lodash-es";
import { ValueOf } from "type-fest";
import { z } from "zod";
import { kAppConstants } from "./appConstants.js";
import { CollaboratorType } from "./collaborator.js";
import { ISubSpaceResource } from "./space.js";

export const kCollaborationRequestStatus = {
  pending: "pending",
  accepted: "accepted",
  rejected: "rejected",
  revoked: "revoked",
} as const;

export type CollaborationRequestStatus = ValueOf<
  typeof kCollaborationRequestStatus
>;

export interface ICollaborationRequest extends ISubSpaceResource {
  providedId: string;
  type: CollaboratorType;
  status: CollaborationRequestStatus;
  title: string;
  message: string;
  workspaceId: string;
}

export const addCollaborationRequestSchema = z.object({
  title: z.string().min(1).max(kAppConstants.validation.maxNameLength),
  message: z
    .string()
    .max(kAppConstants.validation.maxDescriptionLength)
    .optional(),
  workspaceId: z.string().min(1),
  providedId: z.string().min(1),
  spaceId: z.string().min(1).optional(),
});

export const updateCollaborationRequestSchema = z.object({
  title: z
    .string()
    .min(1)
    .max(kAppConstants.validation.maxNameLength)
    .optional(),
  message: z
    .string()
    .max(kAppConstants.validation.maxDescriptionLength)
    .optional(),
  spaceId: z.string().min(1).optional(),
  providedId: z.string().min(1).optional(),
  status: z.nativeEnum(
    pick(
      kCollaborationRequestStatus,
      kCollaborationRequestStatus.accepted,
      kCollaborationRequestStatus.rejected,
      kCollaborationRequestStatus.revoked
    )
  ),
});

export const getCollaborationRequestSchema = z.object({
  id: z.string().min(1).optional(),
  workspaceId: z.string().min(1).optional(),
  providedId: z.string().min(1).optional(),
  spaceId: z.string().min(1).optional(),
});

export const getCollaborationRequestsSchema = z.object({
  workspaceId: z.string().min(1),
  spaceId: z.string().min(1).optional(),
});

export type IAddCollaborationRequestEndpointResponse = ICollaborationRequest;
export type IUpdateCollaborationRequestEndpointResponse = ICollaborationRequest;
export type IGetCollaborationRequestEndpointResponse = ICollaborationRequest;
export type IGetCollaborationRequestsEndpointResponse = ICollaborationRequest[];
