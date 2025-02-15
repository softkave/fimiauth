import {checkAuthorizationWithAgent} from '../../contexts/authorizationChecks/checkAuthorizaton.js';
import {kSemanticModels} from '../../contexts/injection/injectables.js';
import {SemanticProviderOpParams} from '../../contexts/semantic/types.js';
import {
  AssignedPermissionGroupMeta,
  PermissionGroup,
  PermissionGroupMatcher,
  PublicAssignedPermissionGroupMeta,
  PublicPermissionGroup,
} from '../../definitions/permissionGroups.js';
import {FimidaraPermissionAction} from '../../definitions/permissionItem.js';
import {Agent, SessionAgent} from '../../definitions/system.js';
import {appAssert} from '../../utils/assertion.js';
import {getTimestamp} from '../../utils/dateFns.js';
import {getFields, makeExtract, makeListExtract} from '../../utils/extract.js';
import {getResourceId} from '../../utils/fns.js';
import {indexArray} from '../../utils/indexArray.js';
import {kReuseableErrors} from '../../utils/reusableErrors.js';
import {InvalidRequestError, NotFoundError} from '../errors.js';
import {agentExtractor, workspaceResourceFields} from '../extractors.js';
import {checkWorkspaceExists} from '../workspaces/utils.js';

const assignedPermissionGroupsFields =
  getFields<PublicAssignedPermissionGroupMeta>({
    permissionGroupId: true,
    assignedAt: true,
    assignedBy: agentExtractor,
    assigneeEntityId: true,
  });

export const assignedPermissionGroupsExtractor = makeExtract(
  assignedPermissionGroupsFields
);
export const assignedPermissionGroupsListExtractor = makeListExtract(
  assignedPermissionGroupsFields
);

const permissionGroupFields = getFields<PublicPermissionGroup>({
  ...workspaceResourceFields,
  name: true,
  description: true,
});

export const permissionGroupExtractor = makeExtract(permissionGroupFields);
export const permissionGroupListExtractor = makeListExtract(
  permissionGroupFields
);

export async function checkPermissionGroupAuthorization(
  agent: SessionAgent,
  permissionGroup: PermissionGroup,
  action: FimidaraPermissionAction,
  opts?: SemanticProviderOpParams
) {
  const workspace = await checkWorkspaceExists(permissionGroup.workspaceId);
  await checkAuthorizationWithAgent({
    agent,
    opts,
    workspaceId: workspace.resourceId,
    spaceId: permissionGroup.spaceId,
    target: {action, targetId: permissionGroup.resourceId},
  });

  return {agent, permissionGroup, workspace};
}

export async function checkPermissionGroupAuthorization02(
  agent: SessionAgent,
  id: string,
  action: FimidaraPermissionAction
) {
  const permissionGroup = await kSemanticModels
    .permissionGroup()
    .getOneById(id);

  assertPermissionGroup(permissionGroup);
  return checkPermissionGroupAuthorization(agent, permissionGroup, action);
}

export async function checkPermissionGroupAuthorization03(
  agent: SessionAgent,
  matcher: PermissionGroupMatcher,
  action: FimidaraPermissionAction,
  opts?: SemanticProviderOpParams
) {
  const permissionGroup = await getPermissionGroupWithMatcher({
    matcher,
    opts,
  });

  appAssert(permissionGroup, kReuseableErrors.permissionGroup.notFound());
  return checkPermissionGroupAuthorization(agent, permissionGroup, action);
}

export async function checkPermissionGroupsExist(params: {
  spaceId: string;
  idList: string[];
  opts?: SemanticProviderOpParams;
}) {
  const {spaceId, idList, opts} = params;

  // TODO: use exists with $or or implement bulk ops
  const permissionGroups = await kSemanticModels
    .permissionGroup()
    .getManyBySpaceAndIdList({spaceId, resourceIdList: idList}, opts);

  if (idList.length !== permissionGroups.length) {
    const map = indexArray(permissionGroups, {indexer: getResourceId});
    idList.forEach(id =>
      appAssert(map[id], kReuseableErrors.permissionGroup.notFound(id))
    );
  }
}

export function mergePermissionGroupsWithInput(
  agent: Agent,
  entityId: string,
  permissionGroups: AssignedPermissionGroupMeta[],
  input: string[]
) {
  const inputMap = indexArray(input);
  return permissionGroups
    .filter(item => !inputMap[item.permissionGroupId])
    .concat(
      input.map(id => ({
        permissionGroupId: id,
        assignedAt: getTimestamp(),
        assignedBy: agent,
        assigneeEntityId: entityId,
      }))
    );
}

export function throwPermissionGroupNotFound() {
  throw new NotFoundError('Permission group not found');
}

export function assertPermissionGroup(
  permissionGroup?: PermissionGroup | null
): asserts permissionGroup {
  appAssert(permissionGroup, kReuseableErrors.permissionGroup.notFound());
}

export async function getPermissionGroupWithMatcher(params: {
  matcher: PermissionGroupMatcher;
  opts?: SemanticProviderOpParams;
}) {
  const {matcher, opts} = params;
  const {spaceId, name, permissionGroupId} = matcher;

  if (permissionGroupId) {
    return kSemanticModels
      .permissionGroup()
      .getOneById(permissionGroupId, opts);
  }

  if (spaceId && name) {
    return kSemanticModels.permissionGroup().getByName({spaceId, name}, opts);
  }

  throw new InvalidRequestError('Permission group ID or name not set');
}
