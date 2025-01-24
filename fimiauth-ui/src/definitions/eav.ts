import { ValueOf } from "type-fest";

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

export interface IEav {
  id: string;
  entity: string;
  entityType: EavEntityType;
  attribute: EavAttribute;
  valueType: EavValueType;
  value: string;
  createdAt: number;
  lastUpdatedAt: number;
  lastUpdatedBy: string;
  createdBy: string;
}
