import {FimidaraPermissionAction} from '../../definitions/permissionItem.js';
import {
  ResourceWrapper,
  SessionAgent,
  getWorkspaceResourceTypeList,
} from '../../definitions/system.js';
import {Workspace} from '../../definitions/workspace.js';
import {convertToArray} from '../../utils/fns.js';
import {indexArray} from '../../utils/indexArray.js';
import {PartialRecord} from '../../utils/types.js';
import {INTERNAL_getResources} from '../resources/getResources.js';
import {FetchResourceItem} from '../resources/types.js';
import {
  PermissionItemInputTarget,
  ResolvedEntityPermissionItemTarget,
} from './types.js';

export class PermissionItemTargets {
  protected targetsMapById: PartialRecord<string, ResourceWrapper>;
  protected workspace?: ResourceWrapper;

  constructor(protected resources: ResourceWrapper[]) {
    this.targetsMapById = indexArray(resources, {path: 'resourceId'});
  }

  getByTarget = (
    target: PermissionItemInputTarget | PermissionItemInputTarget[]
  ) => {
    const targets: Record<
      string,
      ResourceWrapper & ResolvedEntityPermissionItemTarget
    > = {};

    convertToArray(target).forEach(next => {
      // TODO: should we throw error when some targets are not found?
      if (next.targetId) {
        convertToArray(next.targetId).forEach(targetId => {
          const found = this.targetsMapById[targetId];

          if (found) {
            const resolvedTarget: ResourceWrapper &
              ResolvedEntityPermissionItemTarget = found;
            resolvedTarget.targetId = targetId;
            targets[targetId] = resolvedTarget;
          }
        });
      }
    });

    return {targets, targetList: Object.values(targets)};
  };

  getResources(): Readonly<ResourceWrapper[]> {
    return this.resources;
  }
}

export async function getPermissionItemTargets(
  agent: SessionAgent,
  workspace: Workspace,
  target:
    | Partial<PermissionItemInputTarget>
    | Partial<PermissionItemInputTarget>[],
  action: FimidaraPermissionAction
) {
  const resources = await INTERNAL_getResources({
    agent,
    workspaceId: workspace.resourceId,
    allowedTypes: getWorkspaceResourceTypeList(),
    inputResources: convertToArray(target).map(
      (nextTarget): FetchResourceItem => {
        return {
          action,
          resourceId: nextTarget.targetId,
        };
      }
    ),
    checkAuth: true,
    checkBelongsToWorkspace: true,
  });

  return new PermissionItemTargets(resources);
}
