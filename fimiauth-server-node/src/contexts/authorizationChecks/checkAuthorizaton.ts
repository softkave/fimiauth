import {defaultTo, first, get, isString, set} from 'lodash-es';
import {OmitFrom} from 'softkave-js-utils';
import {ValueOf} from 'type-fest';
import {
  FimidaraPermissionAction,
  PermissionItem,
  kFimidaraPermissionActions,
} from '../../definitions/permissionItem.js';
import {SessionAgent} from '../../definitions/system.js';
import {PermissionDeniedError} from '../../endpoints/errors.js';
import {appAssert} from '../../utils/assertion.js';
import {ServerError} from '../../utils/errors.js';
import {convertToArray, toCompactArray, toUniqArray} from '../../utils/fns.js';
import {sortPermissionEntityInheritanceMap} from '../../utils/permissionEntityUtils.js';
import {kReuseableErrors} from '../../utils/reusableErrors.js';
import {kSemanticModels} from '../injection/injectables.js';
import {SemanticProviderOpParams} from '../semantic/types.js';

export interface AccessCheckTarget {
  entityId: string;
  action: FimidaraPermissionAction | FimidaraPermissionAction[];
  /** single target, or target + containers, e.g file + parent folder IDs */
  targetId: string | string[];
}

export interface CheckAuthorizationParams {
  workspaceId: string;
  spaceId: string;
  workspace?: {publicPermissionGroupId: string};
  target: AccessCheckTarget;
  opts?: SemanticProviderOpParams;
  nothrow?: boolean;
}

export type ResolvedPermissionCheck =
  | {
      hasAccess: true;
      item: PermissionItem;
    }
  | {
      hasAccess: false;
      item?: PermissionItem;
    };

type AccessCheckGroupedPermissions = Record<
  /** entityId */ string,
  Record<
    /** targetId */ string,
    Partial<Record</** action */ FimidaraPermissionAction, PermissionItem[]>>
  >
>;

export interface ResolvedPermissionsAccessCheckerType {
  checkForTargetId: (
    entityId: string,
    targetId: string,
    action: FimidaraPermissionAction,
    nothrow?: boolean
  ) => ResolvedPermissionCheck;
  checkAuthParams: (nothrow?: boolean) => ResolvedPermissionCheck[];
}

export const kResolvedTargetChildrenAccess = {
  full: 'full',
  deny: 'deny',
  partial: 'partial',
} as const;

export type ResolvedTargetChildrenAccess = ValueOf<
  typeof kResolvedTargetChildrenAccess
>;

export type ResolvedTargetChildrenAccessCheck =
  | {
      access: typeof kResolvedTargetChildrenAccess.full;
      item: PermissionItem;
      partialDenyItems: PermissionItem[];
      partialDenyIds: string[];
    }
  | {
      access: typeof kResolvedTargetChildrenAccess.deny;
      item: PermissionItem;
    }
  | {
      access: typeof kResolvedTargetChildrenAccess.partial;
      item?: PermissionItem;
      partialAllowItems: PermissionItem[];
      partialAllowIds: string[];
    };

class ResolvedPermissionsAccessChecker
  implements ResolvedPermissionsAccessCheckerType
{
  constructor(
    protected permissions: AccessCheckGroupedPermissions,
    protected authParams: CheckAuthorizationParams
  ) {}

  checkForTargetId(
    entityId: string,
    targetId: string,
    action: FimidaraPermissionAction,
    nothrow?: boolean
  ) {
    const key = `${entityId}.${targetId}.${action}`;
    const wildcardKey = `${entityId}.${targetId}.${kFimidaraPermissionActions.wildcard}`;
    const items = get(
      this.permissions,
      key,
      get(this.permissions, wildcardKey, [])
    ) as PermissionItem[];
    return this.checkAccess(items, nothrow);
  }

  checkAuthParams(nothrow = this.authParams.nothrow) {
    const {target} = this.authParams;
    const targetId = first(convertToArray(target.targetId));

    if (targetId) {
      return convertToArray(this.authParams.target.action).map(nextAction =>
        this.checkForTargetId(target.entityId, targetId, nextAction, nothrow)
      );
    } else {
      throw new ServerError('Target ID not present');
    }
  }

  protected checkAccess = (
    items: PermissionItem[],
    nothrow = false
  ): ResolvedPermissionCheck => {
    const item = first(items);

    if (item?.access) {
      return {item, hasAccess: true};
    } else if (nothrow) {
      return {item, hasAccess: false};
    } else {
      throw new PermissionDeniedError({item});
    }
  };
}

export async function getAuthorizationAccessChecker(
  params: CheckAuthorizationParams
) {
  const {itemsMap} = await fetchAndSortAgentPermissionItems(params);
  return new ResolvedPermissionsAccessChecker(itemsMap, params);
}

export async function checkAuthorization(params: CheckAuthorizationParams) {
  const checker = await getAuthorizationAccessChecker(params);
  return checker.checkAuthParams();
}

export async function resolveEntityData(
  params: CheckAuthorizationParams & {fetchEntitiesDeep: boolean}
) {
  const {target, spaceId} = params;
  const workspaceModel = kSemanticModels.workspace();
  const permissionsModel = kSemanticModels.permissions();

  const workspace =
    params.workspace ??
    (await workspaceModel.getOneById(params.workspaceId, params.opts));
  appAssert(workspace, kReuseableErrors.workspace.notFound());

  const [entityInheritanceMap, publicInheritanceMap] = await Promise.all([
    permissionsModel.getEntityInheritanceMap(
      {entityId: target.entityId, spaceId, fetchDeep: params.fetchEntitiesDeep},
      params.opts
    ),
    permissionsModel.getEntityInheritanceMap(
      {
        spaceId,
        entityId: workspace.publicPermissionGroupId,
        fetchDeep: params.fetchEntitiesDeep,
      },
      params.opts
    ),
  ]);

  const {sortedItemsList: entitySortedItemList} =
    sortPermissionEntityInheritanceMap({
      map: entityInheritanceMap,
      entityId: target.entityId,
    });

  const {sortedItemsList: publicSortedItemList} =
    sortPermissionEntityInheritanceMap({
      map: publicInheritanceMap,
      entityId: workspace.publicPermissionGroupId,
    });

  const sortedItemsList = entitySortedItemList.concat(publicSortedItemList);
  const entityIdList = sortedItemsList.map(item => item.id);

  return {entityIdList};
}

export async function fetchAgentPermissionItems(
  params: CheckAuthorizationParams & {fetchEntitiesDeep: boolean}
) {
  const {workspaceId, target, spaceId} = params;
  const targetId = toUniqArray(target.targetId, workspaceId);
  const action = convertToArray(target.action).concat(
    kFimidaraPermissionActions.wildcard
  );

  const {entityIdList} = await resolveEntityData(params);
  return await kSemanticModels.permissions().getPermissionItems(
    {
      action,
      targetId,
      spaceId,
      entityId: entityIdList,
      sortByTarget: true,
      sortByDate: true,
      sortByEntity: true,
    },
    params.opts
  );
}

export async function fetchAndSortAgentPermissionItems(
  params: CheckAuthorizationParams
) {
  const items = await fetchAgentPermissionItems({
    ...params,
    fetchEntitiesDeep: true,
  });
  const targetId = first(convertToArray(params.target.targetId));
  return sortOutPermissionItems(items, params.target.entityId, targetId);
}

function sortOutPermissionItems(
  items: PermissionItem[],
  replaceEntityId?: string,
  replaceTargetId?: string
) {
  const map: AccessCheckGroupedPermissions = {};

  items.forEach(item => {
    const key = [
      replaceEntityId ?? item.entityId,
      replaceTargetId ?? item.targetId,
      item.action,
    ];

    const entries = get(map, key) ?? [];
    entries.push(item);
    set(map, key, entries);
  });

  return {items, itemsMap: map};
}

async function resolveTargetChildrenPartialAccessCheck(
  params: OmitFrom<CheckAuthorizationParams, 'nothrow'>
) {
  const {workspaceId, target, spaceId} = params;
  const action = convertToArray(target.action).concat(
    kFimidaraPermissionActions.wildcard
  );
  const targetParentId = defaultTo(
    first(toCompactArray(target.targetId)),
    workspaceId
  );

  // TODO: preferrably fetch once cause it's currently fetched twice, in
  // checkAuthorization and in here
  const {entityIdList} = await resolveEntityData({
    ...params,
    fetchEntitiesDeep: true,
  });
  const items = await kSemanticModels.permissions().getPermissionItems(
    {
      action,
      targetParentId,
      spaceId,
      entityId: entityIdList,
      sortByDate: true,
      sortByEntity: true,
    },
    params.opts
  );

  const partialAllowItems: PermissionItem[] = [];
  const partialAllowIds: string[] = [];
  const partialDenyItems: PermissionItem[] = [];
  const partialDenyIds: string[] = [];

  items.forEach(item => {
    if (item.access) {
      partialAllowIds.push(item.targetId);
      partialAllowItems.push(item);
    } else {
      partialDenyIds.push(item.targetId);
      partialDenyItems.push(item);
    }
  });

  return {
    partialAllowIds,
    partialAllowItems,
    partialDenyIds,
    partialDenyItems,
  };
}

export async function resolveTargetChildrenAccessCheck(
  params: OmitFrom<CheckAuthorizationParams, 'nothrow'>
): Promise<ResolvedTargetChildrenAccessCheck> {
  const {target} = params;

  // Only support single action reads
  appAssert(isString(target.action));

  const [
    parentCheckList,
    {partialAllowIds, partialAllowItems, partialDenyIds, partialDenyItems},
  ] = await Promise.all([
    checkAuthorization({...params, nothrow: true}),
    resolveTargetChildrenPartialAccessCheck(params),
  ]);

  const parentCheck = first(parentCheckList);

  // Only supporting single action reads
  appAssert(parentCheck && parentCheckList.length === 1);

  if (parentCheck.hasAccess) {
    return {
      partialDenyIds,
      partialDenyItems,
      access: kResolvedTargetChildrenAccess.full,
      item: parentCheck.item,
    };
  } else if (
    !parentCheck.hasAccess &&
    parentCheck.item &&
    partialAllowIds.length === 0
  ) {
    return {access: kResolvedTargetChildrenAccess.deny, item: parentCheck.item};
  } else {
    return {
      partialAllowIds,
      partialAllowItems,
      access: kResolvedTargetChildrenAccess.partial,
    };
  }
}

export function getWorkspacePermissionContainers(
  workspaceId: string
): string[] {
  return [workspaceId];
}

export async function checkAuthorizationWithAgent(
  params: Omit<CheckAuthorizationParams, 'target'> & {
    agent: SessionAgent;
    target: Omit<CheckAuthorizationParams['target'], 'entityId'> & {
      entityId?: string;
    };
  }
) {
  const {agent, target} = params;
  const agentId = agent?.agentId;
  appAssert(agentId);
  return await checkAuthorization({
    ...params,
    target: {...target, entityId: agentId},
  });
}

export async function resolveTargetChildrenAccessCheckWithAgent(
  params: OmitFrom<CheckAuthorizationParams, 'target' | 'nothrow'> & {
    agent: SessionAgent;
    target: Omit<CheckAuthorizationParams['target'], 'entityId'> & {
      entityId?: string;
    };
  }
) {
  const {agent, target, spaceId} = params;
  const agentId = agent?.agentId;
  appAssert(agentId);
  return await resolveTargetChildrenAccessCheck({
    ...params,
    target: {...target, entityId: agentId},
  });
}
