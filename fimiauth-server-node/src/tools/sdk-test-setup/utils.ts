import {faker} from '@faker-js/faker';
import {promises as fspromises} from 'fs';
import {
  kSemanticModels,
  kUtilsInjectables,
} from '../../contexts/injection/injectables.js';
import {SemanticProviderMutationParams} from '../../contexts/semantic/types.js';
import {Workspace} from '../../definitions/workspace.js';
import {INTERNAL_createAgentToken} from '../../endpoints/agentTokens/addToken/utils.js';
import {getPublicAgentToken} from '../../endpoints/agentTokens/utils.js';
import {addAssignedPermissionGroupList} from '../../endpoints/assignedItems/addAssignedItems.js';
import INTERNAL_createWorkspace from '../../endpoints/workspaces/addWorkspace/internalCreateWorkspace.js';
import {kSystemSessionAgent} from '../../utils/agent.js';
import {appAssert} from '../../utils/assertion.js';

async function insertWorkspace(opts: SemanticProviderMutationParams) {
  const companyName = faker.company.name();
  return await INTERNAL_createWorkspace(
    {name: companyName, description: 'For SDK tests'},
    kSystemSessionAgent,
    opts
  );
}

async function createAgentToken(
  workspace: Workspace,
  opts: SemanticProviderMutationParams
) {
  const token = await INTERNAL_createAgentToken({
    agent: kSystemSessionAgent,
    workspaceId: workspace.resourceId,
    spaceId: workspace.spaceId,
    data: {
      name: faker.lorem.words(2),
      description: 'Agent token for SDK tests',
    },
    opts,
  });

  appAssert(token.workspaceId, 'workspaceId not present in agent token');
  const tokenStr = (await getPublicAgentToken(token, /** shouldEncode */ true))
    .jwtToken;

  return {tokenStr, token};
}

export async function setupSDKTestReq() {
  const {workspace, token, tokenStr} = await kSemanticModels
    .utils()
    .withTxn(async opts => {
      const {workspace, adminPermissionGroup} = await insertWorkspace(opts);
      const {token, tokenStr} = await createAgentToken(workspace, opts);
      await addAssignedPermissionGroupList({
        agent: kSystemSessionAgent,
        workspaceId: workspace.resourceId,
        spaceId: workspace.spaceId,
        permissionGroupsInput: [adminPermissionGroup.resourceId],
        assigneeId: token.resourceId,
        deleteExisting: false, // don't delete existing assigned permission groups
        skipPermissionGroupsExistCheck: true, // skip permission groups check
        skipAuthCheck: true,
        opts,
      });

      return {workspace, token, tokenStr};
    });

  try {
    const jsSdkTestEnvFilepath = './sdk/js-sdk/.env.test';
    await fspromises.access(jsSdkTestEnvFilepath);

    // TODO: pick server URL port from env file
    const envText = `FIMIDARA_TEST_WORKSPACE_ID="${workspace.resourceId}"
FIMIDARA_TEST_AUTH_TOKEN="${tokenStr}"
FIMIDARA_TEST_FILEPATH="/src/testutils/testdata/testdata.txt"
FIMIDARA_TEST_FOLDER_PATH="/src/testutils/testdata"
FIMIDARA_SERVER_URL="http://localhost:${
      kUtilsInjectables.suppliedConfig().httpPort
    }"`;
    await fspromises.writeFile(jsSdkTestEnvFilepath, envText, 'utf-8');
    kUtilsInjectables.logger().log('Wrote to js sdk .env.test file');
  } catch (error: unknown) {
    kUtilsInjectables.logger().log('Error writing .env.test file');
    kUtilsInjectables.logger().error(error);
  }

  kUtilsInjectables.logger().log(`Workspace ID: ${workspace.resourceId}`);
  kUtilsInjectables.logger().log(`Agent token ID: ${token.resourceId}`);
  kUtilsInjectables.logger().log(`Agent token token: ${tokenStr}`);
}
