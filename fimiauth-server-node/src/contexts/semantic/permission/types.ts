import {
  PermissionEntityInheritanceMap,
  PermissionGroup,
} from '../../../definitions/permissionGroups.js';
import {
  FimidaraPermissionAction,
  PermissionItem,
} from '../../../definitions/permissionItem.js';
import {Resource} from '../../../definitions/system.js';
import {
  SemanticProviderOpParams,
  SemanticProviderQueryListParams,
  SemanticProviderQueryParams,
} from '../types.js';

export type SemanticPermissionProviderType_GetPermissionItemsProps = {
  spaceId: string;
  entityId: string | string[];
  action?: FimidaraPermissionAction | FimidaraPermissionAction[];
  containerId?: string | string[];
  targetId?: string | string[];
  /** Sort the permission items by last updated date. */
  sortByDate?: boolean;
  /** Sort the permission items by entity, i.e following the order of
   * `entityId` passed. */
  sortByEntity?: boolean;
};

export type SemanticPermissionProviderType_CountPermissionItemsProps = Pick<
  SemanticPermissionProviderType_GetPermissionItemsProps,
  'spaceId' | 'entityId' | 'action' | 'targetId' | 'containerId'
>;

export interface SemanticPermissionProviderType {
  getEntityAssignedPermissionGroups(
    props: {entityId: string; spaceId: string; fetchDeep?: boolean},
    options?: SemanticProviderQueryListParams<PermissionGroup>
  ): Promise<{
    permissionGroups: PermissionGroup[];
    inheritanceMap: PermissionEntityInheritanceMap;
  }>;
  getEntityInheritanceMap(
    props: {entityId: string; spaceId: string; fetchDeep?: boolean},
    options?: SemanticProviderOpParams
  ): Promise<PermissionEntityInheritanceMap>;
  getEntity(
    props: {entityId: string},
    opts?: SemanticProviderQueryParams<Resource>
  ): Promise<Resource | null>;
  getPermissionItems(
    props: SemanticPermissionProviderType_GetPermissionItemsProps,
    options?: SemanticProviderQueryListParams<PermissionItem>
  ): Promise<PermissionItem[]>;
  countPermissionItems(
    props: SemanticPermissionProviderType_CountPermissionItemsProps,
    options?: SemanticProviderOpParams
  ): Promise<number>;
  sortItems(params: {
    items: PermissionItem[];
    entityId: string | string[] | undefined;
    sortByEntity?: boolean;
    sortByDate?: boolean;
  }): PermissionItem[];
}
