import {faker} from '@faker-js/faker';
import {kSemanticModels} from '../../../contexts/injection/injectables.js';
import {Space} from '../../../definitions/space.js';
import {Agent, kFimidaraResourceType} from '../../../definitions/system.js';
import {getNewIdForResource, newResource} from '../../../utils/resource.js';

export function generateSpaceForTest(seed: Partial<Space>) {
  const agentType = kFimidaraResourceType.AgentToken;
  const agentTokenId = getNewIdForResource(agentType);
  const createdBy: Agent = {
    agentType,
    agentTokenId,
    agentId: agentTokenId,
  };
  const workspaceId =
    seed.workspaceId ?? getNewIdForResource(kFimidaraResourceType.Workspace);
  const token = newResource<Space>(kFimidaraResourceType.Space, {
    createdBy,
    lastUpdatedBy: createdBy,
    name: faker.company.name(),
    description: faker.lorem.sentence(),
    workspaceId,
    spaceId: workspaceId,
    publicPermissionGroupId: getNewIdForResource(
      kFimidaraResourceType.PermissionGroup
    ),
    ...seed,
  });

  return token;
}

export function generateSpaceListForTest(count = 20, seed: Partial<Space>) {
  const items: Space[] = [];
  for (let i = 0; i < count; i++) {
    items.push(generateSpaceForTest(seed));
  }

  return items;
}

export async function generateAndInsertSpaceListForTest(params: {
  count?: number;
  seed?: Partial<Space>;
}) {
  const {count = 2, seed = {}} = params;
  const items = generateSpaceListForTest(count, seed);
  await kSemanticModels
    .utils()
    .withTxn(async opts => kSemanticModels.space().insertItem(items, opts));

  return items;
}
