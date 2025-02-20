import {uniqBy} from 'lodash-es';
import {kSemanticModels} from '../../../../contexts/injection/injectables.js';
import {kFimidaraResourceType} from '../../../../definitions/system.js';
import {
  genericGetArtifacts,
  noopGetPreRunMetaFn,
} from './genericDefinitions.js';
import {
  DeleteResourceCascadeEntry,
  DeleteResourceDeleteArtifactsFns,
  DeleteResourceFn,
  DeleteResourceGetArtifactsToDeleteFns,
} from './types.js';
import {getResourcePermissionItemArtifacts} from './utils.js';

const getArtifacts: DeleteResourceGetArtifactsToDeleteFns = {
  ...genericGetArtifacts,
  [kFimidaraResourceType.Space]: ({args, opts}) =>
    kSemanticModels.space().getManyBySpaceId({spaceId: args.spaceId}, opts),
  [kFimidaraResourceType.PermissionItem]: async params => {
    const {args, opts} = params;
    const [spaceOwnedPermissions, spacePermissionItems] = await Promise.all([
      kSemanticModels
        .permissionItem()
        .getManyBySpaceId({spaceId: args.spaceId}, opts),
      getResourcePermissionItemArtifacts(params),
    ]);

    const permissionItemsToDelete = uniqBy(
      [...spaceOwnedPermissions, ...spacePermissionItems],
      'resourceId'
    );

    return permissionItemsToDelete;
  },
};

const deleteArtifacts: DeleteResourceDeleteArtifactsFns = {
  [kFimidaraResourceType.All]: null,
  [kFimidaraResourceType.System]: null,
  [kFimidaraResourceType.Public]: null,
  [kFimidaraResourceType.Collaborator]: ({args, helpers}) =>
    helpers.withTxn(opts =>
      kSemanticModels
        .collaborator()
        .deleteManyBySpaceId({spaceId: args.spaceId}, opts)
    ),
  [kFimidaraResourceType.EndpointRequest]: null,
  [kFimidaraResourceType.App]: null,
  [kFimidaraResourceType.Job]: null,
  [kFimidaraResourceType.Workspace]: null,
  [kFimidaraResourceType.emailBlocklist]: null,
  [kFimidaraResourceType.appShard]: null,
  [kFimidaraResourceType.emailMessage]: null,
  [kFimidaraResourceType.CollaborationRequest]: ({args, helpers}) =>
    helpers.withTxn(opts =>
      kSemanticModels
        .collaborationRequest()
        .deleteManyBySpaceId({spaceId: args.spaceId}, opts)
    ),
  [kFimidaraResourceType.AgentToken]: ({args, helpers}) =>
    helpers.withTxn(opts =>
      kSemanticModels
        .agentToken()
        .deleteManyBySpaceId({spaceId: args.spaceId}, opts)
    ),
  [kFimidaraResourceType.PermissionGroup]: ({args, helpers}) =>
    helpers.withTxn(opts =>
      kSemanticModels
        .permissionGroup()
        .deleteManyBySpaceId({spaceId: args.spaceId}, opts)
    ),
  [kFimidaraResourceType.PermissionItem]: ({args, helpers}) =>
    helpers.withTxn(opts =>
      kSemanticModels
        .permissionItem()
        .deleteManyBySpaceId({spaceId: args.spaceId}, opts)
    ),
  [kFimidaraResourceType.Space]: ({args, helpers}) =>
    helpers.withTxn(opts =>
      kSemanticModels.space().deleteManyBySpaceId({spaceId: args.spaceId}, opts)
    ),
  [kFimidaraResourceType.AssignedItem]: ({args, helpers}) =>
    helpers.withTxn(opts =>
      kSemanticModels
        .assignedItem()
        .deleteManyBySpaceId({spaceId: args.spaceId}, opts)
    ),
  [kFimidaraResourceType.jobHistory]: ({args, helpers}) =>
    helpers.withTxn(opts =>
      kSemanticModels
        .jobHistory()
        .deleteManyBySpaceId({spaceId: args.spaceId}, opts)
    ),
};

const deleteResourceFn: DeleteResourceFn = ({args, helpers}) =>
  helpers.withTxn(opts =>
    kSemanticModels.workspace().deleteOneById(args.resourceId, opts)
  );

export const deleteSpaceCascadeEntry: DeleteResourceCascadeEntry = {
  deleteResourceFn,
  getArtifactsToDelete: getArtifacts,
  deleteArtifacts: deleteArtifacts,
  getPreRunMetaFn: noopGetPreRunMetaFn,
};
