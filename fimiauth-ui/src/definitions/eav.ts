import { ValueOf } from "type-fest";
import { IResource } from "./resource.js";

export const kEavEntityType = {
  agent: "agent",
  collaborationRequest: "collabReq",
} as const;

export const kEavValueType = {
  permissionGroup: "pg",
} as const;

export const kEavAttribute = {
  assigned: "assigned",
} as const;

export type EavEntityType = ValueOf<typeof kEavEntityType>;
export type EavValueType = ValueOf<typeof kEavValueType>;
export type EavAttribute = ValueOf<typeof kEavAttribute>;

export interface IEav extends IResource {
  entity: string;
  entityType: EavEntityType;
  attribute: EavAttribute;
  valueType: EavValueType;
  value: string;
}

export interface IEavInput {
  entity: string;
  entityType: EavEntityType;
  attribute: EavAttribute;
  valueType: EavValueType;
  value: string;
}
