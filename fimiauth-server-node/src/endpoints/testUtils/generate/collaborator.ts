import {getNewId} from 'softkave-js-utils';
import {kSemanticModels} from '../../../contexts/injection/injectables.js';
import {Collaborator} from '../../../definitions/collaborator.js';
import {Agent, kFimidaraResourceType} from '../../../definitions/system.js';
import {getTimestamp} from '../../../utils/dateFns.js';
import {getNewIdForResource} from '../../../utils/resource.js';
import {
  GeneratePartialTestDataFn,
  defaultGeneratePartialTestDataFn,
  generateTestList,
} from './utils.js';

export function generateCollaboratorForTest(seed: Partial<Collaborator> = {}) {
  const createdAt = getTimestamp();
  const createdBy: Agent = {
    agentId: getNewIdForResource(kFimidaraResourceType.AgentToken),
    agentType: kFimidaraResourceType.AgentToken,
    agentTokenId: getNewIdForResource(kFimidaraResourceType.AgentToken),
  };
  const item: Collaborator = {
    createdAt,
    createdBy,
    lastUpdatedAt: createdAt,
    lastUpdatedBy: createdBy,
    resourceId: getNewIdForResource(kFimidaraResourceType.Collaborator),
    workspaceId: getNewIdForResource(kFimidaraResourceType.Workspace),
    isDeleted: false,
    spaceId: getNewIdForResource(kFimidaraResourceType.Space),
    providedResourceId: getNewId(),
    ...seed,
  };
  return item;
}

export function generateCollaboratorListForTest(
  count = 20,
  genPartial: GeneratePartialTestDataFn<Collaborator> = defaultGeneratePartialTestDataFn
) {
  return generateTestList(
    () => generateCollaboratorForTest(),
    count,
    genPartial
  );
}

export async function generateAndInsertCollaboratorListForTest(
  count = 20,
  genPartial: GeneratePartialTestDataFn<Collaborator> = defaultGeneratePartialTestDataFn
) {
  const items = generateCollaboratorListForTest(count, genPartial);
  await kSemanticModels
    .utils()
    .withTxn(async opts =>
      kSemanticModels.collaborator().insertItem(items, opts)
    );
  return items;
}
