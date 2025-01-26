import {faker} from '@faker-js/faker';
import * as argon2 from 'argon2';
import assert from 'assert';
import {add} from 'date-fns';
import {globalSetup} from '../../contexts/globalUtils.js';
import {kSemanticModels} from '../../contexts/injection/injectables.js';
import {IServerRequest} from '../../contexts/types.js';
import {AgentToken, PublicAgentToken} from '../../definitions/agentToken.js';
import {
  BaseTokenData,
  kCurrentJWTTokenVersion,
} from '../../definitions/system.js';
import {PublicWorkspace, Workspace} from '../../definitions/workspace.js';
import {FimidaraSuppliedConfig} from '../../resources/config.js';
import {kPublicSessionAgent, kSystemSessionAgent} from '../../utils/agent.js';
import {getTimestamp} from '../../utils/dateFns.js';
import {convertToArray} from '../../utils/fns.js';
import addAgentTokenEndpoint from '../agentTokens/addToken/handler.js';
import {
  AddAgentTokenEndpointParams,
  NewAgentTokenInput,
} from '../agentTokens/addToken/types.js';
import sendRequest from '../collaborationRequests/sendRequest/handler.js';
import {
  CollaborationRequestInput,
  SendCollaborationRequestEndpointParams,
} from '../collaborationRequests/sendRequest/types.js';
import addPermissionGroup from '../permissionGroups/addPermissionGroup/handler.js';
import {
  AddPermissionGroupEndpointParams,
  NewPermissionGroupInput,
} from '../permissionGroups/addPermissionGroup/types.js';
import addPermissionItems from '../permissionItems/addItems/handler.js';
import {AddPermissionItemsEndpointParams} from '../permissionItems/addItems/types.js';
import {PermissionItemInput} from '../permissionItems/types.js';
import RequestData from '../RequestData.js';
import {initFimidara} from '../runtime/initFimidara.js';
import {BaseEndpointResult} from '../types.js';
import addWorkspace from '../workspaces/addWorkspace/handler.js';
import {AddWorkspaceEndpointParams} from '../workspaces/addWorkspace/types.js';
import {makeRootnameFromName} from '../workspaces/utils.js';
import MockTestEmailProviderContext from './context/email/MockTestEmailProviderContext.js';

export function getTestEmailProvider() {
  return new MockTestEmailProviderContext();
}

export async function initTests(overrides: FimidaraSuppliedConfig = {}) {
  await globalSetup(
    {
      useFimidaraApp: false,
      useFimidaraWorkerPool: false,
      ...overrides,
    },
    {
      useHandleFolderQueue: true,
      useHandleUsageRecordQueue: true,
      useHandleAddInternalMultipartIdQueue: true,
      useHandlePrepareFileQueue: true,
    }
  );
  await initFimidara();
}

export async function initFnTests() {
  await globalSetup(
    {useFimidaraApp: false, useFimidaraWorkerPool: false},
    {
      useHandleFolderQueue: true,
      useHandleUsageRecordQueue: true,
      useHandleAddInternalMultipartIdQueue: true,
      useHandlePrepareFileQueue: true,
    }
  );
}

export function assertEndpointResultOk(result?: BaseEndpointResult | void) {
  if (result?.errors?.length) {
    throw result.errors;
  }

  return true;
}

export function mockExpressRequest(token?: BaseTokenData) {
  const req: IServerRequest = {auth: token} as unknown as IServerRequest;
  return req;
}

export function mockExpressRequestWithAgentToken(
  token: Pick<
    PublicAgentToken,
    'resourceId' | 'createdAt' | 'expiresAt' | 'refreshToken'
  >
) {
  const req: IServerRequest = {
    auth:
      token.resourceId === kSystemSessionAgent.agentTokenId ||
      token.resourceId === kPublicSessionAgent.agentTokenId
        ? undefined
        : {
            version: kCurrentJWTTokenVersion,
            sub: {
              id: token.resourceId,
            },
            iat: token.createdAt,
            exp: token.expiresAt,
          },
  } as unknown as IServerRequest;

  return req;
}

export async function mockExpressRequestWithAgentRefreshToken(
  token: Pick<
    PublicAgentToken,
    'resourceId' | 'createdAt' | 'expiresAt' | 'refreshToken'
  >
) {
  const req: IServerRequest = {
    auth:
      token.resourceId === kSystemSessionAgent.agentTokenId ||
      token.resourceId === kPublicSessionAgent.agentTokenId
        ? undefined
        : {
            version: kCurrentJWTTokenVersion,
            sub: {
              id: token.resourceId,
              refreshToken: token.refreshToken
                ? await argon2.hash(token.refreshToken)
                : undefined,
            },
            iat: token.createdAt,
            exp: token.expiresAt,
          },
  } as unknown as IServerRequest;

  return req;
}

export function mockExpressRequestForPublicAgent() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const req: IServerRequest = {};
  return req;
}

export interface IInsertWorkspaceForTestResult {
  workspace: PublicWorkspace;
  rawWorkspace: Workspace;
}

export async function insertWorkspaceForTest(
  userToken: AgentToken,
  workspaceInput: Partial<AddWorkspaceEndpointParams> = {}
): Promise<IInsertWorkspaceForTestResult> {
  const companyName = faker.lorem.words(6);
  const reqData = RequestData.fromExpressRequest<AddWorkspaceEndpointParams>(
    mockExpressRequestWithAgentToken(userToken),
    {
      name: companyName,
      rootname: makeRootnameFromName(companyName),
      description: faker.company.catchPhraseDescriptor(),
      // usageThresholds: generateTestUsageThresholdInputMap(),
      ...workspaceInput,
    }
  );

  const result = await addWorkspace(reqData);
  assertEndpointResultOk(result);

  const rawWorkspace = await kSemanticModels
    .workspace()
    .getOneById(result.workspace.resourceId);
  assert(rawWorkspace);
  return {rawWorkspace, workspace: result.workspace};
}

export async function insertPermissionGroupForTest(
  userToken: AgentToken,
  workspaceId: string,
  permissionGroupInput: Partial<NewPermissionGroupInput> = {}
) {
  const reqData =
    RequestData.fromExpressRequest<AddPermissionGroupEndpointParams>(
      mockExpressRequestWithAgentToken(userToken),
      {
        workspaceId,
        name: faker.lorem.words(3),
        description: faker.lorem.words(10),
        ...permissionGroupInput,
      }
    );

  const result = await addPermissionGroup(reqData);
  assertEndpointResultOk(result);
  return result;
}

export async function insertPermissionItemsForTest(
  userToken: AgentToken,
  workspaceId: string,
  input: PermissionItemInput | PermissionItemInput[]
) {
  const reqData =
    RequestData.fromExpressRequest<AddPermissionItemsEndpointParams>(
      mockExpressRequestWithAgentToken(userToken),
      {workspaceId, items: convertToArray(input)}
    );
  const result = await addPermissionItems(reqData);
  assertEndpointResultOk(result);
  return result;
}

export async function insertRequestForTest(
  userToken: AgentToken,
  workspaceId: string,
  requestInput: Partial<CollaborationRequestInput> = {}
) {
  const reqData =
    RequestData.fromExpressRequest<SendCollaborationRequestEndpointParams>(
      mockExpressRequestWithAgentToken(userToken),
      {
        workspaceId,
        recipientEmail: faker.internet.email(),
        message: faker.lorem.paragraph(),
        expires: getTimestamp(add(Date.now(), {days: 10})),
        ...requestInput,
      }
    );

  const result = await sendRequest(reqData);
  assertEndpointResultOk(result);
  return result;
}

export async function insertAgentTokenForTest(
  userToken: AgentToken,
  workspaceId: string,
  tokenInput: Partial<NewAgentTokenInput> = {}
) {
  const reqData = RequestData.fromExpressRequest<AddAgentTokenEndpointParams>(
    mockExpressRequestWithAgentToken(userToken),
    {
      workspaceId,
      expiresAt: getTimestamp(add(Date.now(), {days: 1})),
      name: faker.lorem.words(7),
      description: faker.lorem.words(10),
      ...tokenInput,
    }
  );

  const result = await addAgentTokenEndpoint(reqData);
  assertEndpointResultOk(result);

  const rawToken = await kSemanticModels
    .agentToken()
    .getOneById(result.token.resourceId);
  assert(rawToken);

  return {...result, rawToken};
}
