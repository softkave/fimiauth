import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {kUtilsInjectables} from '../../../contexts/injection/injectables.js';
import {kFimidaraPermissionActions} from '../../../definitions/permissionItem.js';
import {appAssert} from '../../../utils/assertion.js';
import {ServerError} from '../../../utils/errors.js';
import {validate} from '../../../utils/validate.js';
import {checkSpaceAuthorization03} from '../utils.js';
import {DeleteSpaceEndpoint} from './types.js';
import {beginDeleteSpace} from './utils.js';
import {deleteSpaceJoiSchema} from './validation.js';

const deleteSpace: DeleteSpaceEndpoint = async reqData => {
  const data = validate(reqData.data, deleteSpaceJoiSchema);
  const agent = await kUtilsInjectables
    .session()
    .getAgentFromReq(
      reqData,
      kSessionUtils.permittedAgentTypes.api,
      kSessionUtils.accessScopes.api
    );

  const {space, workspace} = await checkSpaceAuthorization03(
    agent,
    data,
    kFimidaraPermissionActions.deleteSpace
  );

  const [job] = await beginDeleteSpace({
    agent,
    workspaceId: workspace.resourceId,
    resources: [space],
    spaceId: space.workspaceId,
  });
  appAssert(job, new ServerError(), 'Could not create delete space job');

  return {jobId: job.resourceId};
};

export default deleteSpace;
