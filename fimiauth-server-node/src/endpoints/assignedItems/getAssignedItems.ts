import {defaultTo} from 'lodash-es';
import {kSemanticModels} from '../../contexts/injection/injectables.js';
import {SemanticProviderQueryListParams} from '../../contexts/semantic/types.js';
import {AssignedItem} from '../../definitions/assignedItem.js';
import {FimidaraResourceType} from '../../definitions/system.js';

export async function getResourceAssignedItems(params: {
  spaceId: string;
  resourceId: string;
  assignedItemTypes?: Array<FimidaraResourceType>;
  opts?: SemanticProviderQueryListParams<AssignedItem>;
}) {
  const {spaceId, resourceId, assignedItemTypes, opts} = params;
  return await kSemanticModels.assignedItem().getByAssignee({
    spaceId,
    assigneeId: resourceId,
    assignedItemType: assignedItemTypes,
    options: opts,
  });
}

export async function getResourceAssignedItemsSortedByType(params: {
  spaceId: string;
  resourceId: string;
  /** List of assigned item types to fetch. If not specified, all assigned items
   * will be fetched. If specified, result will contain empty arrays if no
   * assigned items of the specified type are found. */
  assignedItemTypes?: Array<FimidaraResourceType>;
  opts?: SemanticProviderQueryListParams<AssignedItem>;
}) {
  const {spaceId, resourceId, assignedItemTypes, opts} = params;
  const items = await getResourceAssignedItems({
    spaceId,
    resourceId,
    assignedItemTypes,
    opts,
  });

  // Add default values if specific assigned item types are specified
  const sortedItems: Record<string, AssignedItem[]> = assignedItemTypes
    ? assignedItemTypes.reduce(
        (acc, type) => {
          acc[type] = [];
          return acc;
        },
        {} as Record<string, AssignedItem[]>
      )
    : {};

  items.forEach(item => {
    const typeItems = defaultTo(sortedItems[item.assignedItemType], []);
    typeItems.push(item);
    sortedItems[item.assignedItemType] = typeItems;
  });

  return sortedItems;
}
