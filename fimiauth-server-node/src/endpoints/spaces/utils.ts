import {checkAuthorizationWithAgent} from '../../contexts/authorizationChecks/checkAuthorizaton.js';
import {kSemanticModels} from '../../contexts/injection/injectables.js';
import {
  SemanticProviderMutationParams,
  SemanticProviderOpParams,
} from '../../contexts/semantic/types.js';
import {FimidaraPermissionAction} from '../../definitions/permissionItem.js';
import {PublicSpace, Space} from '../../definitions/space.js';
import {SessionAgent} from '../../definitions/system.js';
import {appAssert} from '../../utils/assertion.js';
import {getFields, makeExtract, makeListExtract} from '../../utils/extract.js';
import {getResourceId} from '../../utils/fns.js';
import {indexArray} from '../../utils/indexArray.js';
import {kReuseableErrors} from '../../utils/reusableErrors.js';
import {NotFoundError} from '../errors.js';
import {workspaceResourceFields} from '../extractors.js';
import {checkWorkspaceExists} from '../workspaces/utils.js';

const spaceFields = getFields<PublicSpace>({
  ...workspaceResourceFields,
  name: true,
  description: true,
});

export const spaceExtractor = makeExtract(spaceFields);
export const spaceListExtractor = makeListExtract(spaceFields);

export async function checkSpaceAuthorization(
  agent: SessionAgent,
  space: Space,
  action: FimidaraPermissionAction,
  opts?: SemanticProviderOpParams
) {
  const workspace = await checkWorkspaceExists(space.workspaceId);
  await checkAuthorizationWithAgent({
    agent,
    workspace,
    opts,
    workspaceId: workspace.resourceId,
    target: {action, targetId: space.resourceId},
  });
  return {agent, space, workspace};
}

export async function checkSpaceAuthorization02(
  agent: SessionAgent,
  id: string,
  action: FimidaraPermissionAction
) {
  const space = await kSemanticModels.space().getOneById(id);
  assertSpace(space);
  return checkSpaceAuthorization(agent, space, action);
}

export async function checkSpaceAuthorization03(
  agent: SessionAgent,
  input: {spaceId: string},
  action: FimidaraPermissionAction,
  opts?: SemanticProviderOpParams
) {
  const space = await kSemanticModels.space().getOneById(input.spaceId, opts);

  appAssert(space, new NotFoundError('Space not found'));
  return checkSpaceAuthorization(agent, space, action);
}

export async function checkSpacesExist(
  workspaceId: string,
  idList: string[],
  opts?: SemanticProviderMutationParams
) {
  // TODO: use exists with $or or implement bulk ops
  const spaces = await kSemanticModels
    .space()
    .getManyByWorkspaceAndIdList({workspaceId, resourceIdList: idList}, opts);

  if (idList.length !== spaces.length) {
    const map = indexArray(spaces, {indexer: getResourceId});
    idList.forEach(id =>
      appAssert(map[id], kReuseableErrors.space.notFound(id))
    );
  }
}

export function assertSpace(space?: Space | null): asserts space {
  appAssert(space, kReuseableErrors.space.notFound());
}
