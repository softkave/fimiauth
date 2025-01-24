import { ValueOf } from "type-fest";
import { z } from "zod";

export interface ISpace {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  createdAt: number;
  lastUpdatedAt: number;
  lastUpdatedBy: string;
  createdBy: string;
}

export const kSpaceType = {
  workspace: "ws",
  external: "ext",
} as const;

export type SpaceType = ValueOf<typeof kSpaceType>;

export interface ISubSpaceResource {
  spaceId: string;
  spaceType: SpaceType;
}

export const addSpaceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  workspaceId: z.string().min(1),
});

export const updateSpaceSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export const getSpaceByIdSchema = z.object({
  id: z.string().min(1),
});

export const getSpacesSchema = z.object({
  workspaceId: z.string().min(1),
});

export type IAddSpaceEndpointResponse = ISpace;
export type IUpdateSpaceEndpointResponse = ISpace;
export type IGetSpaceEndpointResponse = ISpace;
export type IGetSpacesEndpointResponse = ISpace[];
