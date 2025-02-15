import {faker} from '@faker-js/faker';
import {kSemanticModels} from '../../../contexts/injection/injectables.js';
import {Agent, kFimidaraResourceType} from '../../../definitions/system.js';
import {Workspace} from '../../../definitions/workspace.js';
import {getTimestamp} from '../../../utils/dateFns.js';
import {getNewIdForResource} from '../../../utils/resource.js';

export function generateTestWorkspace(seed: Partial<Workspace> = {}) {
  const createdAt = getTimestamp();
  const createdBy: Agent = {
    agentTokenId: getNewIdForResource(kFimidaraResourceType.AgentToken),
    agentId: getNewIdForResource(kFimidaraResourceType.AgentToken),
    agentType: kFimidaraResourceType.AgentToken,
    ...seed.createdBy,
  };
  const lastUpdatedBy: Agent = {...createdBy, ...seed.lastUpdatedBy};
  const name = faker.company.name();
  const resourceId =
    seed.resourceId ||
    seed.workspaceId ||
    getNewIdForResource(kFimidaraResourceType.Workspace);

  const workspace: Workspace = {
    publicPermissionGroupId: getNewIdForResource(
      kFimidaraResourceType.PermissionGroup
    ),
    description: faker.lorem.sentence(),
    lastUpdatedAt: createdAt,
    workspaceId: resourceId,
    isDeleted: false,
    lastUpdatedBy,
    resourceId,
    createdAt,
    createdBy,
    name,
    spaceId: resourceId,
    ...seed,
  };

  return workspace;
}

export function generateWorkspaceListForTest(
  count = 20,
  seed: Partial<Workspace> = {}
) {
  const workspaces: Workspace[] = [];

  for (let i = 0; i < count; i++) {
    workspaces.push(generateTestWorkspace(seed));
  }

  return workspaces;
}

export async function generateAndInsertWorkspaceListForTest(
  count = 20,
  extra: Partial<Workspace> = {}
) {
  const items = generateWorkspaceListForTest(count, extra);
  await kSemanticModels
    .utils()
    .withTxn(async opts => kSemanticModels.workspace().insertItem(items, opts));

  return items;
}
