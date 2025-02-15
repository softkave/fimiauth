import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {kUtilsInjectables} from '../../../contexts/injection/injectables.js';
import {kFimidaraPermissionActions} from '../../../definitions/permissionItem.js';
import {appAssert} from '../../../utils/assertion.js';
import {validate} from '../../../utils/validate.js';
import {checkWorkspaceAuthorization02} from '../utils.js';
import {DeleteWorkspaceEndpoint} from './types.js';
import {beginDeleteWorkspace} from './utils.js';
import {deleteWorkspaceJoiSchema} from './validation.js';

const deleteWorkspace: DeleteWorkspaceEndpoint = async reqData => {
  const data = validate(reqData.data, deleteWorkspaceJoiSchema);
  const agent = await kUtilsInjectables
    .session()
    .getAgentFromReq(
      reqData,
      kSessionUtils.permittedAgentTypes.api,
      kSessionUtils.accessScopes.api
    );
  const {workspace} = await checkWorkspaceAuthorization02(
    agent,
    kFimidaraPermissionActions.deleteWorkspace,
    data.workspaceId
  );

  const [job] = await beginDeleteWorkspace({
    agent,
    workspaceId: workspace.resourceId,
    spaceId: workspace.spaceId,
    resources: [workspace],
  });
  appAssert(job, 'Could not create delete workspace job');

  return {jobId: job.resourceId};
};

export default deleteWorkspace;
