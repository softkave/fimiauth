import {first, get, set} from 'lodash-es';
import {convertToArray, makeStringKey} from 'softkave-js-utils';
import {ValueOf} from 'type-fest';
import {
  FimidaraPermissionAction,
  kFimidaraPermissionActions,
  PermissionItem,
} from '../../definitions/permissionItem.js';
import {SessionAgent} from '../../definitions/system.js';
import {PermissionDeniedError} from '../../endpoints/errors.js';
import {appAssert} from '../../utils/assertion.js';
import {toUniqArray} from '../../utils/fns.js';
import {sortPermissionEntityInheritanceMap} from '../../utils/permissionEntityUtils.js';
import {kReuseableErrors} from '../../utils/reusableErrors.js';
import {kSemanticModels} from '../injection/injectables.js';
import {SemanticProviderOpParams} from '../semantic/types.js';

export interface AccessCheckTarget {
  entityId: string;
  action: FimidaraPermissionAction;
  targetId: string;
}

export interface CheckAuthorizationParams {
  workspaceId: string;
  spaceId: string;
  workspace?: {publicPermissionGroupId: string};
  target: AccessCheckTarget;
  opts?: SemanticProviderOpParams;
  nothrow?: boolean;
  nothrowOnDeny?: boolean;
  nothrowOnPartialAccess?: boolean;
  excludePublicPermissions?: boolean;
}

type AccessCheckMappedPermissions = Record<
  /** entityId */ string,
  Record<
    /** targetId */ string,
    Partial<Record</** action */ FimidaraPermissionAction, PermissionItem[]>>
  >
>;

export const kResolvedAuthCheckAccess = {
  full: 'f',
  deny: 'd',
  partial: 'p',
} as const;

export type ResolvedAuthCheckAccess = ValueOf<typeof kResolvedAuthCheckAccess>;
export type ResolvedAuthCheckAccessCheck =
  | {
      access: typeof kResolvedAuthCheckAccess.full;
      item: PermissionItem;
    }
  | {
      access: typeof kResolvedAuthCheckAccess.deny;
      item?: PermissionItem;
    }
  | {
      access: typeof kResolvedAuthCheckAccess.partial;
      item?: PermissionItem;
      allowItems: PermissionItem[];
      allowedTargetIds: string[];
      denyItems: PermissionItem[];
      deniedTargetIds: string[];
    };

class PermissionsAccessChecker {
  constructor(
    protected permissions: AccessCheckMappedPermissions,
    protected authParams: CheckAuthorizationParams
  ) {}

  checkForTargetId(params: {
    entityId: string;
    targetId: string;
    action: FimidaraPermissionAction;
    nothrow?: boolean;
    nothrowOnDeny?: boolean;
    nothrowOnPartialAccess?: boolean;
  }) {
    const {
      entityId,
      targetId,
      action,
      nothrow,
      nothrowOnDeny = nothrow,
      nothrowOnPartialAccess = nothrow,
    } = params;

    const key = `${entityId}.${targetId}.${action}`;
    const wildcardKey = `${entityId}.${targetId}.${kFimidaraPermissionActions.wildcard}`;
    const items = get(
      this.permissions,
      key,
      get(this.permissions, wildcardKey, [])
    ) as PermissionItem[];

    return this.resolveAccess({
      targetId,
      items,
      nothrowOnDeny,
      nothrowOnPartialAccess,
    });
  }

  checkAuthParams(params: {nothrow?: boolean} = {}) {
    const {nothrow = this.authParams.nothrow} = params;
    const {
      target,
      nothrowOnDeny = nothrow,
      nothrowOnPartialAccess = nothrow,
    } = this.authParams;

    return this.checkForTargetId({
      entityId: target.entityId,
      targetId: target.targetId,
      action: target.action,
      nothrow,
      nothrowOnDeny: nothrow ?? nothrowOnDeny,
      nothrowOnPartialAccess: nothrow ?? nothrowOnPartialAccess,
    });
  }

  protected resolveAccess = (params: {
    targetId: string;
    items: PermissionItem[];
    nothrowOnDeny?: boolean;
    nothrowOnPartialAccess?: boolean;
  }): ResolvedAuthCheckAccessCheck => {
    const {targetId, items, nothrowOnDeny, nothrowOnPartialAccess} = params;
    const allowItems: PermissionItem[] = [];
    const allowedTargetIds: string[] = [];
    const denyItems: PermissionItem[] = [];
    const deniedTargetIds: string[] = [];
    let allowItem: PermissionItem | undefined;
    let denyItem: PermissionItem | undefined;

    items.some(item => {
      if (item.targetId === targetId) {
        // permission item is for the target
        if (item.access) {
          allowItem = item;
        } else {
          denyItem = item;
        }

        return true;
      } else {
        // permission item is for a target contained within the target
        if (item.access) {
          allowedTargetIds.push(item.targetId);
          allowItems.push(item);
        } else {
          deniedTargetIds.push(item.targetId);
          denyItems.push(item);
        }

        return false;
      }
    });

    if (allowItems.length || denyItems.length) {
      if (nothrowOnPartialAccess) {
        return {
          allowedTargetIds,
          allowItems,
          deniedTargetIds,
          denyItems,
          item: allowItem ?? denyItem,
          access: kResolvedAuthCheckAccess.partial,
        };
      } else {
        // TODO: capture what makes it partial
        throw new PermissionDeniedError({item: denyItem});
      }
    } else if (allowItem) {
      return {
        item: allowItem,
        access: kResolvedAuthCheckAccess.full,
      };
    } else {
      if (nothrowOnDeny) {
        return {item: denyItem, access: kResolvedAuthCheckAccess.deny};
      } else {
        throw new PermissionDeniedError({item: denyItem});
      }
    }
  };
}

export async function getAuthorizationAccessChecker(
  params: CheckAuthorizationParams
) {
  const permissionsMap = await fetchAndSortAgentPermissionItems(params);
  return new PermissionsAccessChecker(permissionsMap.itemsMap, params);
}

export async function checkAuthorization(params: CheckAuthorizationParams) {
  const checker = await getAuthorizationAccessChecker(params);
  return checker.checkAuthParams();
}

async function getAndSortEntityInheritance(params: {
  fetchEntitiesDeep: boolean;
  spaceId: string;
  entityId: string;
  opts?: SemanticProviderOpParams;
}) {
  const {spaceId, entityId, fetchEntitiesDeep, opts} = params;
  const entityInheritanceMap = await kSemanticModels
    .permissions()
    .getEntityInheritanceMap(
      {entityId, spaceId, fetchDeep: fetchEntitiesDeep},
      opts
    );

  const {sortedItemsList: entitySortedItemList} =
    sortPermissionEntityInheritanceMap({
      map: entityInheritanceMap,
      entityId,
    });

  const entityIdList = entitySortedItemList.map(item => item.id);
  return entityIdList;
}

async function resolveEntityInheritance(
  params: CheckAuthorizationParams & {fetchEntitiesDeep: boolean}
) {
  const {target, spaceId, excludePublicPermissions} = params;
  let publicPermissionGroupId: string | undefined =
    params.workspace?.publicPermissionGroupId;

  if (!excludePublicPermissions && !publicPermissionGroupId) {
    const workspace =
      params.workspace ??
      (await kSemanticModels
        .workspace()
        .getOneById(params.workspaceId, params.opts));
    appAssert(workspace, kReuseableErrors.workspace.notFound());
    publicPermissionGroupId = workspace.publicPermissionGroupId;
  }

  const [entityIdList, publicEntityIdList] = await Promise.all([
    getAndSortEntityInheritance({
      spaceId,
      entityId: target.entityId,
      fetchEntitiesDeep: params.fetchEntitiesDeep,
      opts: params.opts,
    }),
    publicPermissionGroupId
      ? getAndSortEntityInheritance({
          spaceId,
          entityId: publicPermissionGroupId,
          fetchEntitiesDeep: params.fetchEntitiesDeep,
          opts: params.opts,
        })
      : Promise.resolve([]),
  ]);

  const completeEntityIdList = [...entityIdList, ...publicEntityIdList];
  return completeEntityIdList;
}

async function fetchEntityPermissions(
  params: CheckAuthorizationParams & {fetchEntitiesDeep: boolean}
) {
  const {workspaceId, target, spaceId} = params;
  const targetId = toUniqArray(target.targetId, workspaceId);
  const action = convertToArray(target.action).concat(
    kFimidaraPermissionActions.wildcard
  );

  const entityIdList = await resolveEntityInheritance(params);
  const [targetPermissions, containerPermissions] = await Promise.all([
    kSemanticModels.permissions().getPermissionItems(
      {
        action,
        targetId,
        spaceId,
        entityId: entityIdList,
      },
      params.opts
    ),
    kSemanticModels.permissions().getPermissionItems(
      {
        action,
        spaceId,
        containerId: targetId,
        entityId: entityIdList,
      },
      params.opts
    ),
  ]);

  const permissions = kSemanticModels.permissions().sortItems({
    entityId: entityIdList,
    items: [...targetPermissions, ...containerPermissions],
    sortByDate: true,
    sortByEntity: true,
  });

  return {permissions};
}

async function fetchAndSortAgentPermissionItems(
  params: CheckAuthorizationParams
) {
  const {permissions} = await fetchEntityPermissions({
    ...params,
    fetchEntitiesDeep: true,
  });

  const targetId = first(convertToArray(params.target.targetId));
  const permissionsMap = mapOutPermissions({
    items: permissions,
    replacementEntityId: params.target.entityId,
    replacementTargetId: targetId,
    compact: true,
  });

  return permissionsMap;
}

function mapOutPermissions(params: {
  items: PermissionItem[];
  replacementEntityId?: string;
  replacementTargetId?: string;
  compact?: boolean;
}) {
  const {items, replacementEntityId, replacementTargetId, compact} = params;
  const map: AccessCheckMappedPermissions = {};
  const seenItems = new Set<string>();
  items.forEach(item => {
    if (compact) {
      const itemKey = makeStringKey([
        item.entityId,
        item.targetId,
        item.action,
      ]);

      if (seenItems.has(itemKey)) {
        return;
      }

      seenItems.add(itemKey);
    }

    const index = [
      replacementEntityId ?? item.entityId,
      replacementTargetId ?? item.targetId,
      item.action,
    ];

    const entries = get(map, index) ?? [];
    entries.push(item);
    set(map, index, entries);
  });

  return {items, itemsMap: map};
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
