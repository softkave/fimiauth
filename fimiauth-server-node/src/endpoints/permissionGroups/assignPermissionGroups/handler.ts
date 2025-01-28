import {convertToArray} from 'softkave-js-utils';
import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {checkAuthorizationWithAgent} from '../../../contexts/authorizationChecks/checkAuthorizaton.js';
import {
  kSemanticModels,
  kUtilsInjectables,
} from '../../../contexts/injection/injectables.js';
import {kFimidaraPermissionActions} from '../../../definitions/permissionItem.js';
import {validate} from '../../../utils/validate.js';
import {addAssignedPermissionGroupList} from '../../assignedItems/addAssignedItems.js';
import {checkPermissionEntitiesExist} from '../../permissionItems/checkPermissionArtifacts.js';
import {getWorkspaceFromEndpointInput} from '../../workspaces/utils.js';
import {checkPermissionGroupsExist} from '../utils.js';
import {AssignPermissionGroupsEndpoint} from './types.js';
import {assignPermissionGroupsJoiSchema} from './validation.js';

const assignPermissionGroups: AssignPermissionGroupsEndpoint =
  async reqData => {
    const data = validate(reqData.data, assignPermissionGroupsJoiSchema);
    const agent = await kUtilsInjectables
      .session()
      .getAgentFromReq(
        reqData,
        kSessionUtils.permittedAgentTypes.api,
        kSessionUtils.accessScopes.api
      );

    const {workspace} = await getWorkspaceFromEndpointInput(agent, data);
    await checkAuthorizationWithAgent({
      agent,
      workspace,
      workspaceId: workspace.resourceId,
      spaceId: data.spaceId ?? workspace.resourceId,
      target: {
        targetId: workspace.resourceId,
        action: kFimidaraPermissionActions.updatePermission,
      },
    });

    const entityIdList = convertToArray(data.entityId);
    const pgIdList = convertToArray(data.permissionGroupId);

    await Promise.all([
      checkPermissionEntitiesExist({
        agent,
        workspaceId: workspace.resourceId,
        spaceId: data.spaceId ?? workspace.resourceId,
        entities: entityIdList,
        action: kFimidaraPermissionActions.updatePermission,
      }),
      checkPermissionGroupsExist({
        spaceId: data.spaceId ?? workspace.resourceId,
        idList: pgIdList,
      }),
    ]);

    await kSemanticModels.utils().withTxn(async opts => {
      // TODO: getEntityAssignedPermissionGroups should support entity ID array

      // Get entities' immediately existing permission groups to avoid assigning
      // twice
      const existingPermissionGroups = await Promise.all(
        entityIdList.map(entityId =>
          kSemanticModels.permissions().getEntityAssignedPermissionGroups(
            {
              entityId,
              spaceId: data.spaceId ?? workspace.resourceId,
              fetchDeep: false,
            },
            opts
          )
        )
      );

      // Filter out permission groups already assigned leaving the ones unassigned
      const unassignedPermissionGroupsByEntity = entityIdList.map(
        (entityId, i) => {
          const {inheritanceMap} = existingPermissionGroups[i];
          return pgIdList.filter(pgId => !inheritanceMap[pgId]);
        }
      );

      await Promise.all(
        unassignedPermissionGroupsByEntity.map((permissionGroupList, i) => {
          const entityId = entityIdList[i];

          if (!permissionGroupList.length) {
            return;
          }

          return addAssignedPermissionGroupList({
            agent,
            workspaceId: workspace.resourceId,
            spaceId: data.spaceId ?? workspace.resourceId,
            permissionGroupsInput: permissionGroupList,
            assigneeId: entityId,
            deleteExisting: false,
            skipPermissionGroupsExistCheck: true,
            skipAuthCheck: true,
            opts,
          });
        })
      );
    });
  };

export default assignPermissionGroups;
