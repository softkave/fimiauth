import {
  kFimidaraPermissionActions,
  PermissionItem,
  PublicPermissionItem,
} from '../../definitions/permissionItem.js';
import {
  FimidaraResourceType,
  kFimidaraResourceType,
  SessionAgent,
} from '../../definitions/system.js';
import {appAssert} from '../../utils/assertion.js';
import {getFields, makeExtract, makeListExtract} from '../../utils/extract.js';
import {convertToArray} from '../../utils/fns.js';
import {getResourceTypeFromId} from '../../utils/resource.js';
import {kReuseableErrors} from '../../utils/reusableErrors.js';
import {InvalidRequestError} from '../errors.js';
import {workspaceResourceFields} from '../extractors.js';
import {INTERNAL_getResources} from '../resources/getResources.js';

const permissionItemFields = getFields<PublicPermissionItem>({
  ...workspaceResourceFields,
  entityId: true,
  entityType: true,
  targetId: true,
  targetType: true,
  action: true,
  access: true,
  containerId: true,
});

export const permissionItemExtractor = makeExtract(permissionItemFields);
export const permissionItemListExtractor =
  makeListExtract(permissionItemFields);

export function throwPermissionItemNotFound() {
  throw kReuseableErrors.permissionItem.notFound();
}

export function getTargetType(data: {
  targetId?: string;
  targetType?: FimidaraResourceType;
}) {
  const targetType = data.targetType
    ? data.targetType
    : data.targetId
      ? getResourceTypeFromId(data.targetId)
      : null;

  appAssert(
    targetType,
    new InvalidRequestError('Target ID or target type must be present')
  );

  return targetType;
}

export function assertPermissionItem(
  item?: PermissionItem | null
): asserts item {
  appAssert(item, kReuseableErrors.permissionItem.notFound());
}

export async function getPermissionItemEntities(params: {
  agent: SessionAgent;
  workspaceId: string;
  spaceId: string;
  entityIds: string | string[];
}) {
  const {agent, workspaceId, spaceId, entityIds} = params;
  const resources = await INTERNAL_getResources({
    agent,
    allowedTypes: [
      kFimidaraResourceType.PermissionGroup,
      kFimidaraResourceType.AgentToken,
    ],
    workspaceId,
    spaceId,
    inputResources: convertToArray(entityIds).map(entityId => ({
      resourceId: entityId,
      action: kFimidaraPermissionActions.updatePermission,
    })),
    checkAuth: true,
    checkBelongsToSpace: true,
  });

  return resources;
}
