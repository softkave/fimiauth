import { pick } from "lodash-es";
import { ValueOf } from "type-fest";
import { z } from "zod";
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
  id: string;
  providedId: string;
  type: CollaboratorType;
  status: CollaborationRequestStatus;
  title: string;
  message: string;
  workspaceId: string;
  createdAt: number;
  lastUpdatedAt: number;
  lastUpdatedBy: string;
  createdBy: string;
}

export const addCollaborationRequestSchema = z.object({
  title: z.string().min(1),
  message: z.string().optional(),
  workspaceId: z.string().min(1),
  providedId: z.string().min(1),
  spaceId: z.string().min(1).optional(),
});

export const updateCollaborationRequestSchema = z.object({
  title: z.string().min(1).optional(),
  message: z.string().optional(),
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

export const getCollaborationRequestByIdSchema = z.object({
  id: z.string().min(1),
});

export const getCollaborationRequestsSchema = z.object({
  workspaceId: z.string().min(1),
  spaceId: z.string().min(1).optional(),
});

export type IAddCollaborationRequestEndpointResponse = ICollaborationRequest;
export type IUpdateCollaborationRequestEndpointResponse = ICollaborationRequest;
export type IGetCollaborationRequestEndpointResponse = ICollaborationRequest;
export type IGetCollaborationRequestsEndpointResponse = ICollaborationRequest[];
