import { ValueOf } from "type-fest";
import { z } from "zod";
import { IResource } from "./resource.js";

export interface ISpace extends IResource {
  providedId?: string;
  name: string;
  description?: string;
  workspaceId: string;
}

export const kSpaceType = {
  workspace: "ws",
  external: "ext",
} as const;

export type SpaceType = ValueOf<typeof kSpaceType>;

export interface ISubSpaceResource extends IResource {
  spaceId: string;
  spaceType: SpaceType;
}

export const addSpaceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  workspaceId: z.string().min(1),
  providedId: z.string().min(1).optional(),
});

export const updateSpaceSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  providedId: z.string().min(1).optional(),
});

export const getSpaceSchema = z.object({
  id: z.string().min(1).optional(),
  workspaceId: z.string().min(1).optional(),
  providedId: z.string().min(1).optional(),
});

export const getSpacesSchema = z.object({
  workspaceId: z.string().min(1),
});

export type IAddSpaceEndpointResponse = ISpace;
export type IUpdateSpaceEndpointResponse = ISpace;
export type IGetSpaceEndpointResponse = ISpace;
export type IGetSpacesEndpointResponse = ISpace[];
