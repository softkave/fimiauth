import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {kUtilsInjectables} from '../../../contexts/injection/injectables.js';
import {kFimidaraPermissionActions} from '../../../definitions/permissionItem.js';
import {validate} from '../../../utils/validate.js';
import {
  checkPermissionGroupAuthorization03,
  permissionGroupExtractor,
} from '../utils.js';
import {GetPermissionGroupEndpoint} from './types.js';
import {getPermissionGroupJoiSchema} from './validation.js';

const getPermissionGroup: GetPermissionGroupEndpoint = async reqData => {
  const data = validate(reqData.data, getPermissionGroupJoiSchema);
  const agent = await kUtilsInjectables
    .session()
    .getAgentFromReq(
      reqData,
      kSessionUtils.permittedAgentTypes.api,
      kSessionUtils.accessScopes.api
    );

  const {permissionGroup} = await checkPermissionGroupAuthorization03(
    agent,
    data,
    kFimidaraPermissionActions.readPermission
  );

  return {
    permissionGroup: permissionGroupExtractor(permissionGroup),
  };
};

export default getPermissionGroup;
