import {omit} from 'lodash-es';
import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {
  kSemanticModels,
  kUtilsInjectables,
} from '../../../contexts/injection/injectables.js';
import {PermissionGroup} from '../../../definitions/permissionGroups.js';
import {kFimidaraPermissionActions} from '../../../definitions/permissionItem.js';
import {getTimestamp} from '../../../utils/dateFns.js';
import {getActionAgentFromSessionAgent} from '../../../utils/sessionUtils.js';
import {validate} from '../../../utils/validate.js';
import {checkPermissionGroupNameAvailable} from '../checkPermissionGroupNameAvailable.js';
import {
  assertPermissionGroup,
  checkPermissionGroupAuthorization03,
  permissionGroupExtractor,
} from '../utils.js';
import {UpdatePermissionGroupEndpoint} from './types.js';
import {updatePermissionGroupJoiSchema} from './validation.js';

const updatePermissionGroup: UpdatePermissionGroupEndpoint = async reqData => {
  const data = validate(reqData.data, updatePermissionGroupJoiSchema);
  const agent = await kUtilsInjectables
    .session()
    .getAgentFromReq(
      reqData,
      kSessionUtils.permittedAgentTypes.api,
      kSessionUtils.accessScopes.api
    );

  const permissionGroup = await kSemanticModels.utils().withTxn(async opts => {
    const {workspace, permissionGroup} =
      await checkPermissionGroupAuthorization03(
        agent,
        data,
        kFimidaraPermissionActions.updatePermission,
        opts
      );

    const update: Partial<PermissionGroup> = {
      ...omit(data.data, 'permissionGroups'),
      lastUpdatedAt: getTimestamp(),
      lastUpdatedBy: getActionAgentFromSessionAgent(agent),
    };

    if (update.name && update.name !== permissionGroup.name) {
      await checkPermissionGroupNameAvailable({
        spaceId: data.spaceId ?? workspace.resourceId,
        name: update.name,
        opts,
      });
    }

    const updatedPermissionGroup = await kSemanticModels
      .permissionGroup()
      .getAndUpdateOneById(permissionGroup.resourceId, update, opts);

    assertPermissionGroup(updatedPermissionGroup);
    return updatedPermissionGroup;
  });

  return {permissionGroup: permissionGroupExtractor(permissionGroup!)};
};

export default updatePermissionGroup;
