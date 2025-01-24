import { ValueOf } from "type-fest";

export const kActionResourceType = {
  workspace: "wkspace",
  agent: "agent",
} as const;

export type ActionResourceType = ValueOf<typeof kActionResourceType>;

export interface IResource {
  id: string;
  createdAt: number;
  lastUpdatedAt: number;
  lastUpdatedBy: string;
  lastUpdatedByType: ActionResourceType;
  createdBy: string;
  createdByType: ActionResourceType;
}

export interface IActionSubject {
  id: string;
  type: ActionResourceType;
}
