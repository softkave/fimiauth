import {checkAuthorizationWithAgent} from '../../contexts/authorizationChecks/checkAuthorizaton.js';
import {kSemanticModels} from '../../contexts/injection/injectables.js';
import {SemanticProviderOpParams} from '../../contexts/semantic/types.js';
import {FimidaraPermissionAction} from '../../definitions/permissionItem.js';
import {SessionAgent} from '../../definitions/system.js';
import {PublicWorkspace, Workspace} from '../../definitions/workspace.js';
import {
  ExtractFieldsFrom,
  getFields,
  makeExtract,
  makeListExtract,
} from '../../utils/extract.js';
import {
  getWorkspaceIdFromSessionAgent,
  getWorkspaceIdNoThrow,
} from '../../utils/sessionUtils.js';
import {NotFoundError} from '../errors.js';
import {workspaceResourceFields} from '../extractors.js';
import {EndpointOptionalWorkspaceIDParam} from '../types.js';

const workspacePublicFields: ExtractFieldsFrom<PublicWorkspace> = {
  ...workspaceResourceFields,
  name: true,
  description: true,
  publicPermissionGroupId: true,
};

const workspaceFields = getFields<PublicWorkspace>(workspacePublicFields);
export const workspaceExtractor = makeExtract(workspaceFields);
export const workspaceListExtractor = makeListExtract(workspaceFields);

export function throwWorkspaceNotFound() {
  throw new NotFoundError('Workspace not found');
}

export function assertWorkspace(
  workspace: Workspace | null | undefined
): asserts workspace {
  if (!workspace) {
    throwWorkspaceNotFound();
  }
}

export async function checkWorkspaceExists(
  workspaceId: string,
  opts?: SemanticProviderOpParams
) {
  const w = await kSemanticModels.workspace().getOneById(workspaceId, opts);
  assertWorkspace(w);
  return w;
}

export async function checkWorkspaceExistsWithAgent(
  agent: SessionAgent,
  workspaceId?: string
) {
  if (!workspaceId) {
    workspaceId = getWorkspaceIdFromSessionAgent(agent, workspaceId);
  }

  return checkWorkspaceExists(workspaceId);
}

export async function checkWorkspaceAuthorization(
  agent: SessionAgent,
  workspace: Workspace,
  action: FimidaraPermissionAction,
  opts?: SemanticProviderOpParams
) {
  await checkAuthorizationWithAgent({
    agent,
    opts,
    workspaceId: workspace.resourceId,
    spaceId: workspace.resourceId,
    target: {action, targetId: workspace.resourceId},
  });

  return {agent, workspace};
}

export async function checkWorkspaceAuthorization02(
  agent: SessionAgent,
  action: FimidaraPermissionAction,
  id?: string
) {
  const workspaceId = getWorkspaceIdFromSessionAgent(agent, id);
  const workspace = await checkWorkspaceExists(workspaceId);
  return checkWorkspaceAuthorization(agent, workspace, action);
}

export abstract class WorkspaceUtils {
  static getPublicWorkspace = workspaceExtractor;
  static getPublicWorkspaceList = workspaceListExtractor;
  static throwWorkspaceNotFound = throwWorkspaceNotFound;
}

export async function getWorkspaceFromEndpointInput(
  agent: SessionAgent,
  data: EndpointOptionalWorkspaceIDParam,
  opts?: SemanticProviderOpParams
) {
  const workspaceId = getWorkspaceIdFromSessionAgent(agent, data.workspaceId);
  const workspace = await checkWorkspaceExists(workspaceId, opts);
  return {workspace};
}

export async function tryGetWorkspaceFromEndpointInput(
  agent: SessionAgent,
  data: EndpointOptionalWorkspaceIDParam
) {
  let workspace: Workspace | undefined = undefined;
  const workspaceId = getWorkspaceIdNoThrow(agent, data.workspaceId);
  if (workspaceId) workspace = await checkWorkspaceExists(workspaceId);
  return {workspace};
}
