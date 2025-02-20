import {flatten} from 'lodash-es';
import {afterAll, beforeAll, describe, test} from 'vitest';
import {kFimidaraResourceType} from '../../../../../definitions/system.js';
import {Workspace} from '../../../../../definitions/workspace.js';
import {generateAndInsertAgentTokenListForTest} from '../../../../testUtils/generate/agentToken.js';
import {generateAndInsertCollaborationRequestListForTest} from '../../../../testUtils/generate/collaborationRequest.js';
import {generateAndInsertCollaboratorListForTest} from '../../../../testUtils/generate/collaborator.js';
import {
  generateAndInsertAssignedItemListForTest,
  generateAndInsertPermissionGroupListForTest,
} from '../../../../testUtils/generate/permissionGroup.js';
import {generateAndInsertPermissionItemListForTest} from '../../../../testUtils/generate/permissionItem.js';
import {generateAndInsertSpaceListForTest} from '../../../../testUtils/generate/space.js';
import {generateAndInsertWorkspaceListForTest} from '../../../../testUtils/generate/workspace.js';
import {completeTests} from '../../../../testUtils/helpers/testFns.js';
import {initTests} from '../../../../testUtils/testUtils.js';
import {deleteWorkspaceCascadeEntry} from '../workspace.js';
import {
  GenerateResourceFn,
  GenerateTypeChildrenDefinition,
  noopGenerateTypeChildren,
  testDeleteResourceArtifactsJob,
} from './testUtils.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

const workspaceGenerateTypeChildren: GenerateTypeChildrenDefinition<Workspace> =
  {
    ...noopGenerateTypeChildren,
    [kFimidaraResourceType.CollaborationRequest]: async ({workspaceId}) =>
      flatten(
        await Promise.all([
          generateAndInsertCollaborationRequestListForTest(2, () => ({
            workspaceId,
          })),
        ])
      ),
    [kFimidaraResourceType.AgentToken]: async ({workspaceId}) =>
      flatten(
        await Promise.all([
          generateAndInsertAgentTokenListForTest(2, {workspaceId}),
        ])
      ),
    [kFimidaraResourceType.PermissionGroup]: async ({workspaceId}) =>
      flatten(
        await Promise.all([
          generateAndInsertPermissionGroupListForTest(2, {workspaceId}),
        ])
      ),
    [kFimidaraResourceType.PermissionItem]: async ({workspaceId}) =>
      flatten(
        await Promise.all([
          generateAndInsertPermissionItemListForTest(2, {workspaceId}),
        ])
      ),
    [kFimidaraResourceType.Space]: async ({workspaceId}) =>
      flatten(
        await Promise.all([
          generateAndInsertSpaceListForTest({
            count: 2,
            seed: {workspaceId},
          }),
        ])
      ),
    [kFimidaraResourceType.Collaborator]: async ({workspaceId}) =>
      flatten(
        await Promise.all([
          generateAndInsertCollaboratorListForTest(2, () => ({workspaceId})),
        ])
      ),
    [kFimidaraResourceType.AssignedItem]: async ({workspaceId}) =>
      flatten(
        await Promise.all([
          generateAndInsertAssignedItemListForTest(2, {workspaceId}),
        ])
      ),
  };

const genResourceFn: GenerateResourceFn<Workspace> = async ({workspaceId}) => {
  const [workspace] = await generateAndInsertWorkspaceListForTest(1, {
    workspaceId,
  });
  return workspace;
};

describe('runDeleteResourceJob, workspace', () => {
  test('runDeleteResourceJobArtifacts', async () => {
    await testDeleteResourceArtifactsJob({
      genResourceFn,
      genChildrenDef: workspaceGenerateTypeChildren,
      deleteCascadeDef: deleteWorkspaceCascadeEntry,
      type: kFimidaraResourceType.Workspace,
    });
  });
});
