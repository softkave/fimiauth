import {AnyObject} from 'softkave-js-utils';
import {ValueOf} from 'type-fest';
import {AgentToken} from './agentToken.js';
import {App, AppShard} from './app.js';
import {AssignedItem} from './assignedItem.js';
import {CollaborationRequest} from './collaborationRequest.js';
import {EmailBlocklist, EmailMessage} from './email.js';
import {Job} from './job.js';
import {JobHistory} from './jobHistory.js';
import {PermissionGroup} from './permissionGroups.js';
import {PermissionItem} from './permissionItem.js';
import {Space} from './space.js';
import {Workspace} from './workspace.js';

export const kCurrentJWTTokenVersion = 1;

export const kTokenAccessScope = {
  /** primarily for client agent tokens, where they should have access to public
   * APIs */
  access: 'access',
} as const;

export type TokenAccessScope = ValueOf<typeof kTokenAccessScope>;

export interface TokenSubjectDefault {
  id: string;
  refreshToken?: string;
}

export interface BaseTokenData<
  Sub extends TokenSubjectDefault = TokenSubjectDefault,
> {
  version: number;
  sub: Sub;
  iat: number;
  exp?: number;
}

export interface Agent {
  agentId: string;
  agentType: FimidaraResourceType;
  agentTokenId: string;
}

export type PublicAgent = Pick<Agent, 'agentId' | 'agentType'>;

export interface SessionAgent extends Agent {
  agentToken: AgentToken;
}

export const kFimidaraPublicResourceType = {
  All: '*',
  System: 'system',
  Public: 'public',
  Workspace: 'workspace',
  CollaborationRequest: 'collaborationRequest',
  AgentToken: 'agentToken',
  PermissionGroup: 'permissionGroup',
  PermissionItem: 'permissionItem',
  Job: 'job',
  Space: 'space',
  Collaborator: 'collaborator',
} as const;

export const kFimidaraResourceType = {
  ...kFimidaraPublicResourceType,
  AssignedItem: 'assignedItem',
  EndpointRequest: 'endpointRequest',
  App: 'app',
  emailMessage: 'emailMessage',
  emailBlocklist: 'emailBlocklist',
  appShard: 'appShard',
  jobHistory: 'jobHistory',
} as const;

export type FimidaraResourceType = ValueOf<typeof kFimidaraResourceType>;
export type FimidaraPublicResourceType = ValueOf<
  typeof kFimidaraPublicResourceType
>;

export const kPermissionAgentTypes: FimidaraResourceType[] = [
  kFimidaraResourceType.AgentToken,
  kFimidaraResourceType.Public,
];

export const kPermissionEntityTypes: FimidaraResourceType[] = [
  kFimidaraResourceType.AgentToken,
  kFimidaraResourceType.PermissionGroup,
];

export const kPermissionContainerTypes: FimidaraResourceType[] = [
  kFimidaraResourceType.Workspace,
];

export function getWorkspaceResourceTypeList(): FimidaraResourceType[] {
  return [
    kFimidaraResourceType.All,
    kFimidaraResourceType.Workspace,
    kFimidaraResourceType.CollaborationRequest,
    kFimidaraResourceType.AgentToken,
    kFimidaraResourceType.PermissionGroup,
    kFimidaraResourceType.PermissionItem,
    kFimidaraResourceType.Space,
  ];
}

export const kValidAgentTypes: FimidaraResourceType[] = [
  kFimidaraResourceType.AgentToken,
];
export const kFimidaraResourceTypeList = Object.values(kFimidaraResourceType);

export interface AppRuntimeState extends Resource {
  resourceId: string; // use kAppRuntimeStatsDocId
  isAppSetup: boolean;
  appWorkspaceId: string;
}

export interface Resource {
  resourceId: string;
  createdAt: number;
  lastUpdatedAt: number;
  lastUpdatedBy?: Agent;
  createdBy?: Agent;
  deletedBy?: Agent;
  isDeleted: boolean;
  deletedAt?: number;
}

export interface ResourceWrapper<T extends Resource = Resource> {
  resourceId: string;
  resourceType: FimidaraResourceType;
  resource: T;
}

export interface WorkspaceResource extends Resource {
  workspaceId: string;
  lastUpdatedBy: Agent;
  createdBy: Agent;
  providedResourceId?: string | null;
}

export type ToPublicDefinitions<T> = {
  [K in keyof T]: NonNullable<T[K]> extends Agent
    ? PublicAgent
    : NonNullable<T[K]> extends FimidaraResourceType
      ? FimidaraPublicResourceType
      : NonNullable<T[K]> extends AnyObject
        ? ToPublicDefinitions<NonNullable<T[K]>>
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
          NonNullable<T[K]> extends any[]
          ? ToPublicDefinitions<NonNullable<T[K]>[number]>
          : T[K];
};

export type PublicResource = ToPublicDefinitions<Resource>;
export type PublicResourceWrapper = ToPublicDefinitions<ResourceWrapper>;
export type PublicWorkspaceResource = ToPublicDefinitions<WorkspaceResource>;

export const kResourceTypeToPossibleChildren: Record<
  FimidaraResourceType,
  FimidaraResourceType[]
> = {
  [kFimidaraResourceType.All]: [],
  [kFimidaraResourceType.System]: [],
  [kFimidaraResourceType.Public]: [],
  [kFimidaraResourceType.Workspace]: [
    kFimidaraResourceType.AgentToken,
    kFimidaraResourceType.AssignedItem,
    kFimidaraResourceType.CollaborationRequest,
    kFimidaraResourceType.Space,
    kFimidaraResourceType.PermissionGroup,
    kFimidaraResourceType.PermissionItem,
  ],
  [kFimidaraResourceType.Space]: [
    kFimidaraResourceType.AgentToken,
    kFimidaraResourceType.AssignedItem,
    kFimidaraResourceType.CollaborationRequest,
    kFimidaraResourceType.PermissionGroup,
    kFimidaraResourceType.PermissionItem,
  ],
  [kFimidaraResourceType.CollaborationRequest]: [
    kFimidaraResourceType.PermissionItem,
  ],
  [kFimidaraResourceType.AgentToken]: [
    kFimidaraResourceType.PermissionItem,
    kFimidaraResourceType.AssignedItem,
  ],
  [kFimidaraResourceType.PermissionGroup]: [
    kFimidaraResourceType.PermissionItem,
    kFimidaraResourceType.AssignedItem,
  ],
  [kFimidaraResourceType.PermissionItem]: [
    kFimidaraResourceType.PermissionItem,
    kFimidaraResourceType.AssignedItem,
  ],
  [kFimidaraResourceType.AssignedItem]: [],
  [kFimidaraResourceType.EndpointRequest]: [],
  [kFimidaraResourceType.Job]: [kFimidaraResourceType.jobHistory],
  [kFimidaraResourceType.App]: [],
  [kFimidaraResourceType.emailMessage]: [],
  [kFimidaraResourceType.emailBlocklist]: [],
  [kFimidaraResourceType.appShard]: [],
  [kFimidaraResourceType.jobHistory]: [],
};

export const kFimidaraTypeToTSTypeNotFound = 1_000 as const;

export type FimidaraTypeToTSType<T extends FimidaraResourceType> =
  T extends typeof kFimidaraResourceType.Workspace
    ? Workspace
    : T extends typeof kFimidaraResourceType.CollaborationRequest
      ? CollaborationRequest
      : T extends typeof kFimidaraResourceType.AgentToken
        ? AgentToken
        : T extends typeof kFimidaraResourceType.PermissionGroup
          ? PermissionGroup
          : T extends typeof kFimidaraResourceType.PermissionItem
            ? PermissionItem
            : T extends typeof kFimidaraResourceType.Space
              ? Space
              : T extends typeof kFimidaraResourceType.AssignedItem
                ? AssignedItem
                : T extends typeof kFimidaraResourceType.Job
                  ? Job
                  : T extends typeof kFimidaraResourceType.App
                    ? App
                    : T extends typeof kFimidaraResourceType.emailMessage
                      ? EmailMessage
                      : T extends typeof kFimidaraResourceType.emailBlocklist
                        ? EmailBlocklist
                        : T extends typeof kFimidaraResourceType.appShard
                          ? AppShard
                          : T extends typeof kFimidaraResourceType.jobHistory
                            ? JobHistory
                            : typeof kFimidaraTypeToTSTypeNotFound;
