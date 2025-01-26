import {AgentToken} from '../../../definitions/agentToken.js';
import {FimidaraPermissionAction} from '../../../definitions/permissionItem.js';
import {
  FimidaraResourceType,
  SessionAgent,
  kFimidaraResourceType,
} from '../../../definitions/system.js';
import {Workspace} from '../../../definitions/workspace.js';
import {kPublicSessionAgent} from '../../../utils/agent.js';
import {makeWorkspaceAgentTokenAgent} from '../../../utils/sessionUtils.js';
import {AnyFn, OrPromise} from '../../../utils/types.js';
import {NewAgentTokenInput} from '../../agentTokens/addToken/types.js';
import {PermissionItemInputTarget} from '../../permissionItems/types.js';
import {BaseEndpointResult} from '../../types.js';
import {AddWorkspaceEndpointParams} from '../../workspaces/addWorkspace/types.js';
import {
  insertAgentTokenForTest,
  insertPermissionItemsForTest,
  insertWorkspaceForTest,
} from '../testUtils.js';

export const kTestSessionAgentTypes = [
  kFimidaraResourceType.AgentToken,
  kFimidaraResourceType.Public,
] as const;

interface GetTestSessionAgentPreResult {
  workspaceResult: Awaited<ReturnType<typeof insertWorkspaceForTest>>;
  adminUserToken: AgentToken;
  sessionAgent: SessionAgent;
  workspace: Workspace;
}

interface GetTestSessionAgentPermissionsOpts {
  actions: FimidaraPermissionAction[];
  target?: PermissionItemInputTarget;
}

interface GetTestSessionAgentPermissionsFnResult<TResult = unknown> {
  permissions: GetTestSessionAgentPermissionsOpts;
  other?: TResult;
}

type GetTestSessionAgentPermissionsFn<TResult = unknown> = AnyFn<
  [GetTestSessionAgentPreResult],
  OrPromise<GetTestSessionAgentPermissionsFnResult<TResult>>
>;

interface GetTestSessionAgentResult<TPermissionsFnResult = unknown>
  extends GetTestSessionAgentPreResult {
  permissionsResult?: BaseEndpointResult | void;
  beforePermissionsFnOtherResult?: GetTestSessionAgentPermissionsFnResult<TPermissionsFnResult>['other'];
  permissionsOpts?: GetTestSessionAgentPermissionsOpts;
  tokenResult?: Awaited<ReturnType<typeof insertAgentTokenForTest>>;
  collaboratorResult?: Awaited<ReturnType<typeof insertUserForTest>>;
}

type GetTestSessionAgentProps<TPermissionsFnResult = unknown> = Partial<{
  workspace: Partial<{
    workspaceInput: Partial<AddWorkspaceEndpointParams>;
  }>;
  token: Partial<{
    tokenInput: Partial<NewAgentTokenInput>;
  }>;
  beforePermissions: GetTestSessionAgentPermissionsFn<TPermissionsFnResult>;
  permissions: GetTestSessionAgentPermissionsOpts;
}>;

export async function getTestSessionAgent<TPermissionsFnResult = unknown>(
  agentType: FimidaraResourceType,
  props: GetTestSessionAgentProps<TPermissionsFnResult> = {}
): Promise<GetTestSessionAgentResult<TPermissionsFnResult>> {
  switch (agentType) {
    case kFimidaraResourceType.AgentToken: {
      const userResult = await insertUserForTest(
        props.user?.userInput,
        props.user?.skipAutoVerifyEmail
      );
      const workspaceResult = await insertWorkspaceForTest(
        userResult.userToken,
        props.workspace?.workspaceInput
      );
      const tokenResult = await insertAgentTokenForTest(
        userResult.userToken,
        workspaceResult.rawWorkspace.resourceId,
        props.token?.tokenInput
      );
      const sessionAgent = makeWorkspaceAgentTokenAgent(tokenResult.rawToken);
      const base: GetTestSessionAgentPreResult = {
        workspaceResult,
        sessionAgent,
        adminUserToken: userResult.userToken,
        workspace: workspaceResult?.rawWorkspace,
      };

      const permissionsCombinedResults = await makeTestSessionAgentPermissions(
        tokenResult.rawToken.resourceId,
        base,
        props
      );

      return {
        ...base,
        ...permissionsCombinedResults,
        tokenResult,
      };
    }

    case kFimidaraResourceType.Public: {
      const workspaceResult = await insertWorkspaceForTest(
        userResult.userToken,
        props.workspace?.workspaceInput
      );
      const sessionAgent = kPublicSessionAgent;
      const base: GetTestSessionAgentPreResult = {
        userResult,
        workspaceResult,
        sessionAgent,
        adminUserToken: userResult.userToken,
        workspace: workspaceResult?.rawWorkspace,
      };

      const permissionsCombinedResults = await makeTestSessionAgentPermissions(
        workspaceResult.rawWorkspace.publicPermissionGroupId,
        base,
        props
      );

      return {
        ...base,
        ...permissionsCombinedResults,
        sessionAgent,
      };
    }

    default: {
      throw new Error(`Unsupported type ${agentType}`);
    }
  }
}

async function makeTestSessionAgentPermissions<TPermissionsFnResult = unknown>(
  entityId: string,
  base: GetTestSessionAgentPreResult,
  props: Pick<
    NonNullable<GetTestSessionAgentProps<TPermissionsFnResult>>,
    'permissions' | 'beforePermissions'
  >
) {
  const {userResult, workspaceResult} = base;

  let permissionsResult:
    | Awaited<ReturnType<typeof insertPermissionItemsForTest>>
    | undefined;
  let permissionsOpts = props.permissions;
  let beforePermissionsFnResult:
    | Awaited<ReturnType<NonNullable<typeof props.beforePermissions>>>
    | undefined;

  if (props.beforePermissions) {
    beforePermissionsFnResult = await props.beforePermissions(base);
  }

  if (beforePermissionsFnResult?.permissions) {
    permissionsOpts = beforePermissionsFnResult.permissions;
  }

  if (permissionsOpts) {
    permissionsResult = await insertPermissionItemsForTest(
      userResult.userToken,
      workspaceResult.rawWorkspace.resourceId,
      /** input */ {
        entityId,
        ...(permissionsOpts.target || {
          targetId: workspaceResult.rawWorkspace.resourceId,
        }),
        access: true,
        action: permissionsOpts.actions,
      }
    );
  }

  return {
    permissionsResult,
    permissionsOpts,
    beforePermissionsFnOtherResult: beforePermissionsFnResult?.other,
  };
}
