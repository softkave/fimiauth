import {faker} from '@faker-js/faker';
import * as argon2 from 'argon2';
import assert from 'assert';
import {add} from 'date-fns';
import {getNewId} from 'softkave-js-utils';
import {globalSetup} from '../../contexts/globalUtils.js';
import {
  kSemanticModels,
  kUtilsInjectables,
} from '../../contexts/injection/injectables.js';
import {kSessionUtils} from '../../contexts/SessionContext.js';
import {IServerRequest} from '../../contexts/types.js';
import {AgentToken, PublicAgentToken} from '../../definitions/agentToken.js';
import {
  BaseTokenData,
  kCurrentJWTTokenVersion,
} from '../../definitions/system.js';
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
import addSpace from '../spaces/addSpace/handler.js';
import {
  AddSpaceEndpointParams,
  NewSpaceInput,
} from '../spaces/addSpace/types.js';
import {BaseEndpointResult} from '../types.js';
import addWorkspace from '../workspaces/addWorkspace/handler.js';
import {AddWorkspaceEndpointParams} from '../workspaces/addWorkspace/types.js';
import MockTestEmailProviderContext from './context/email/MockTestEmailProviderContext.js';
import {appAssert} from '../../utils/assertion.js';

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

export function mockExpressRequestWithSystemAuthId(
  systemAuthId = kUtilsInjectables.suppliedConfig().systemAuthId
) {
  const req: IServerRequest = {
    headers: {
      'x-system-auth-id': systemAuthId,
    },
  } as unknown as IServerRequest;

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

export async function insertWorkspaceForTest(
  workspaceInput: Partial<AddWorkspaceEndpointParams> = {}
) {
  const companyName = faker.lorem.words(6);
  const reqData = RequestData.fromExpressRequest<AddWorkspaceEndpointParams>(
    mockExpressRequestWithSystemAuthId(),
    {
      name: companyName,
      description: faker.company.catchPhraseDescriptor(),
      userId: getNewId(),
      ...workspaceInput,
    }
  );

  const result = await addWorkspace(reqData);
  assertEndpointResultOk(result);

  const rawWorkspace = await kSemanticModels
    .workspace()
    .getOneById(result.workspace.resourceId);
  assert(rawWorkspace);

  const decodedToken = kUtilsInjectables
    .session()
    .decodeToken(result.token.jwtToken);
  const agentToken = await kSemanticModels
    .agentToken()
    .getOneById(decodedToken.sub.id);
  assert(agentToken);

  const userId = reqData.data?.userId;
  appAssert(userId);
  return {rawWorkspace, agentToken, userId, ...result};
}

export async function insertPermissionGroupForTest(
  agentToken: AgentToken,
  workspaceId: string,
  permissionGroupInput: Partial<NewPermissionGroupInput> = {}
) {
  const reqData =
    RequestData.fromExpressRequest<AddPermissionGroupEndpointParams>(
      mockExpressRequestWithAgentToken(agentToken),
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
  agentToken: AgentToken,
  workspaceId: string,
  input: PermissionItemInput | PermissionItemInput[]
) {
  const reqData =
    RequestData.fromExpressRequest<AddPermissionItemsEndpointParams>(
      mockExpressRequestWithAgentToken(agentToken),
      {workspaceId, items: convertToArray(input)}
    );
  const result = await addPermissionItems(reqData);
  assertEndpointResultOk(result);
  return result;
}

export async function insertRequestForTest(
  agentToken: AgentToken,
  workspaceId: string,
  requestInput: Partial<CollaborationRequestInput> = {}
) {
  const reqData =
    RequestData.fromExpressRequest<SendCollaborationRequestEndpointParams>(
      mockExpressRequestWithAgentToken(agentToken),
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
  agentToken: AgentToken,
  workspaceId: string,
  tokenInput: Partial<NewAgentTokenInput> = {}
) {
  const reqData = RequestData.fromExpressRequest<AddAgentTokenEndpointParams>(
    mockExpressRequestWithAgentToken(agentToken),
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

export async function insertSpaceForTest(params: {
  agentToken: AgentToken;
  workspaceId: string;
  spaceInput?: Partial<NewSpaceInput>;
}) {
  const {agentToken, workspaceId, spaceInput = {}} = params;
  const reqData = RequestData.fromExpressRequest<AddSpaceEndpointParams>(
    mockExpressRequestWithAgentToken(agentToken),
    {
      workspaceId,
      name: faker.lorem.words(7),
      description: faker.lorem.words(10),
      ...spaceInput,
    }
  );

  const result = await addSpace(reqData);
  assertEndpointResultOk(result);

  const rawSpace = await kSemanticModels
    .space()
    .getOneById(result.space.resourceId);
  assert(rawSpace);

  return {...result, rawSpace};
}

export async function generateWorkspaceAndSessionAgent() {
  const workspaceResult = await insertWorkspaceForTest();
  const sessionAgent = await kUtilsInjectables
    .session()
    .getAgentFromReq(
      RequestData.fromExpressRequest(
        mockExpressRequestWithAgentToken(workspaceResult.agentToken)
      ),
      kSessionUtils.permittedAgentTypes.api,
      kSessionUtils.accessScopes.api
    );

  return {...workspaceResult, sessionAgent};
}

export async function generateAgentTokenAndSessionAgent(params: {
  workspaceId: string;
  createdBy: AgentToken;
}) {
  const {workspaceId, createdBy} = params;
  const tokenResult = await insertAgentTokenForTest(createdBy, workspaceId);
  const sessionAgent = await kUtilsInjectables
    .session()
    .getAgentFromReq(
      RequestData.fromExpressRequest(
        mockExpressRequestWithAgentToken(tokenResult.rawToken)
      ),
      kSessionUtils.permittedAgentTypes.api,
      kSessionUtils.accessScopes.api
    );

  return {...tokenResult, sessionAgent};
}
