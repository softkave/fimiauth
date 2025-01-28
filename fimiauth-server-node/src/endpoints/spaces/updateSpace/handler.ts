import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {
  kSemanticModels,
  kUtilsInjectables,
} from '../../../contexts/injection/injectables.js';
import {kFimidaraPermissionActions} from '../../../definitions/permissionItem.js';
import {Space} from '../../../definitions/space.js';
import {appAssert} from '../../../utils/assertion.js';
import {getTimestamp} from '../../../utils/dateFns.js';
import {getActionAgentFromSessionAgent} from '../../../utils/sessionUtils.js';
import {validate} from '../../../utils/validate.js';
import {NotFoundError} from '../../errors.js';
import {checkSpaceNameExists} from '../checkSpaceNameExists.js';
import {checkSpaceAuthorization03, spaceExtractor} from '../utils.js';
import {UpdateSpaceEndpoint} from './types.js';
import {updateSpaceJoiSchema} from './validation.js';

const updateSpace: UpdateSpaceEndpoint = async reqData => {
  const data = validate(reqData.data, updateSpaceJoiSchema);
  const agent = await kUtilsInjectables
    .session()
    .getAgentFromReq(
      reqData,
      kSessionUtils.permittedAgentTypes.api,
      kSessionUtils.accessScopes.api
    );

  const space = await kSemanticModels.utils().withTxn(async opts => {
    const {workspace, space} = await checkSpaceAuthorization03(
      agent,
      data,
      kFimidaraPermissionActions.updateSpace,
      opts
    );

    const update: Partial<Space> = {
      ...data.data,
      lastUpdatedAt: getTimestamp(),
      lastUpdatedBy: getActionAgentFromSessionAgent(agent),
    };

    if (update.name && update.name !== space.name) {
      await checkSpaceNameExists(workspace.resourceId, update.name, opts);
    }

    const updatedSpace = await kSemanticModels
      .space()
      .getAndUpdateOneById(space.resourceId, update, opts);
    appAssert(updatedSpace, new NotFoundError('Space not found'));
    return updatedSpace;
  });

  return {space: spaceExtractor(space!)};
};

export default updateSpace;
