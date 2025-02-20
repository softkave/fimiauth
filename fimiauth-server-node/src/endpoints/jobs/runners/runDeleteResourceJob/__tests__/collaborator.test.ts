import {flatten} from 'lodash-es';
import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import {kSemanticModels} from '../../../../../contexts/injection/injectables.js';
import {Collaborator} from '../../../../../definitions/collaborator.js';
import {kFimidaraResourceType} from '../../../../../definitions/system.js';
import {extractResourceIdList} from '../../../../../utils/fns.js';
import {getNewIdForResource} from '../../../../../utils/resource.js';
import {generateAndInsertCollaboratorListForTest} from '../../../../testUtils/generate/collaborator.js';
import {generateAndInsertAssignedItemListForTest} from '../../../../testUtils/generate/permissionGroup.js';
import {generateAndInsertPermissionItemListForTest} from '../../../../testUtils/generate/permissionItem.js';
import {generateAndInsertSpaceListForTest} from '../../../../testUtils/generate/space.js';
import {completeTests} from '../../../../testUtils/helpers/testFns.js';
import {initTests} from '../../../../testUtils/testUtils.js';
import {deleteCollaboratorCascadeEntry} from '../collaborator.js';
import {
  GenerateResourceFn,
  GenerateTypeChildrenDefinition,
  generatePermissionItemsAsChildren,
  noopGenerateTypeChildren,
  testDeleteResourceArtifactsJob,
} from './testUtils.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

const collaboratorGenerateTypeChildren: GenerateTypeChildrenDefinition<Collaborator> =
  {
    ...noopGenerateTypeChildren,
    [kFimidaraResourceType.PermissionItem]: generatePermissionItemsAsChildren,
    [kFimidaraResourceType.AssignedItem]: async ({resource, workspaceId}) =>
      flatten(
        await Promise.all([
          generateAndInsertAssignedItemListForTest(2, {
            workspaceId,
            assigneeId: resource.resourceId,
          }),
        ])
      ),
  };

const genResourceFn: GenerateResourceFn<Collaborator> = async ({
  workspaceId,
}) => {
  const [collaborator] = await generateAndInsertCollaboratorListForTest(
    1,
    () => ({
      workspaceId,
    })
  );
  return collaborator;
};

async function generateNonWorkspaceResources(id: string) {
  const otherWorkspaceId = getNewIdForResource(kFimidaraResourceType.Workspace);
  const [pItems, spaces] = await Promise.all([
    generateAndInsertPermissionItemListForTest(2, {entityId: id}),
    generateAndInsertSpaceListForTest({
      count: 2,
      seed: {
        workspaceId: otherWorkspaceId,
      },
    }),
  ]);

  return {pItems, spaces, otherWorkspaceId};
}

async function expectNonWorkspaceUserResourcesRemain(
  resources: Awaited<ReturnType<typeof generateNonWorkspaceResources>>
) {
  const {pItems, spaces} = resources;
  const [dbPItems, dbSpaces] = await Promise.all([
    kSemanticModels
      .permissionItem()
      .getManyByIdList(extractResourceIdList(pItems)),
    kSemanticModels.space().getManyByIdList(extractResourceIdList(spaces)),
  ]);

  expect(dbPItems.length).toBeGreaterThan(0);
  expect(dbSpaces.length).toBeGreaterThan(0);
}

describe('runDeleteResourceJob, agent token', () => {
  test('runDeleteResourceJobArtifacts', async () => {
    const workspaceId = getNewIdForResource(kFimidaraResourceType.Workspace);
    const collaborator = await genResourceFn({workspaceId});
    const nonWorkspaceResources = await generateNonWorkspaceResources(
      collaborator.resourceId
    );

    await testDeleteResourceArtifactsJob({
      genResourceFn: () => Promise.resolve(collaborator),
      genWorkspaceFn: () => Promise.resolve(workspaceId),
      genChildrenDef: collaboratorGenerateTypeChildren,
      deleteCascadeDef: deleteCollaboratorCascadeEntry,
      type: kFimidaraResourceType.Collaborator,
    });

    await expectNonWorkspaceUserResourcesRemain(nonWorkspaceResources);

    const dbUser = await kSemanticModels
      .collaborator()
      .getOneById(collaborator.resourceId);
    expect(dbUser).toBeTruthy();

    await expectNonWorkspaceUserResourcesRemain(nonWorkspaceResources);
  });
});
