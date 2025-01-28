import {kSemanticModels} from '../../contexts/injection/injectables.js';
import {SemanticProviderMutationParams} from '../../contexts/semantic/types.js';
import {FimidaraResourceType} from '../../definitions/system.js';

export async function deleteResourceAssignedItems(params: {
  spaceId: string;
  resourceId: string | string[];
  assignedItemTypes: FimidaraResourceType[] | undefined;
  opts: SemanticProviderMutationParams;
}) {
  const {spaceId, resourceId, assignedItemTypes, opts} = params;
  await kSemanticModels.assignedItem().deleteByAssigned({
    spaceId,
    assignedId: resourceId,
    assignedItemType: assignedItemTypes,
    opts,
  });
}
