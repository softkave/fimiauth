import {get, mapKeys} from 'lodash-es';
import {
  checkAuthorizationWithAgent,
  kResolvedAuthCheckAccess,
} from '../../contexts/authorizationChecks/checkAuthorizaton.js';
import {kSemanticModels} from '../../contexts/injection/injectables.js';
import {SemanticProviderOpParams} from '../../contexts/semantic/types.js';
import {FimidaraPermissionAction} from '../../definitions/permissionItem.js';
import {
  FimidaraResourceType,
  Resource,
  ResourceWrapper,
  SessionAgent,
  WorkspaceResource,
  kFimidaraResourceType,
} from '../../definitions/system.js';
import {appAssert} from '../../utils/assertion.js';
import {ServerError} from '../../utils/errors.js';
import {convertToArray, isObjectEmpty} from '../../utils/fns.js';
import {indexArray} from '../../utils/indexArray.js';
import {getResourceTypeFromId} from '../../utils/resource.js';
import {PartialRecord} from '../../utils/types.js';
import {
  PromiseWithId,
  waitOnPromisesWithId,
} from '../../utils/waitOnPromises.js';
import {checkResourcesBelongToSpace} from './containerCheckFns.js';
import {FetchResourceItem} from './types.js';

interface ExtendedPromiseWithId<T> extends PromiseWithId<T> {
  resourceType: FimidaraResourceType;
}

type InputsWithIdGroupedByType = PartialRecord<
  FimidaraResourceType,
  Record</** resource ID */ string, FimidaraPermissionAction>
>;

export interface GetResourcesOptions {
  inputResources: Array<FetchResourceItem>;
  allowedTypes: FimidaraResourceType[];
  checkAuth?: boolean;
  agent: SessionAgent;
  workspaceId: string;
  spaceId: string;
  nothrowOnCheckError?: boolean;
  dataFetchRunOptions?: SemanticProviderOpParams;
  checkBelongsToSpace?: boolean;
}

type GetResourcesResourceWrapper = ResourceWrapper & {
  action: FimidaraPermissionAction;
};

export async function INTERNAL_getResources(options: GetResourcesOptions) {
  const {
    inputResources,
    agent,
    workspaceId,
    spaceId,
    nothrowOnCheckError,
    allowedTypes,
    dataFetchRunOptions,
    checkBelongsToSpace,
    checkAuth = true,
  } = options;

  const {inputsWithIdByType} = groupItemsToFetch(inputResources, allowedTypes);
  const fetchResults = await Promise.all([
    fetchResourcesById(inputsWithIdByType, dataFetchRunOptions),
  ]);

  let [resources] = fetchResults;

  if (checkBelongsToSpace) {
    checkResourcesBelongToSpace(
      spaceId,
      resources.map(item => item.resource as WorkspaceResource)
    );
  }

  if (checkAuth) {
    resources = await authCheckResources({
      agent,
      workspaceId,
      spaceId,
      resources,
      nothrowOnCheckError,
    });
  }

  return resources;
}

function groupItemsToFetch(
  inputResources: Array<FetchResourceItem>,
  allowedTypes: FimidaraResourceType[]
) {
  const inputsWithIdByType: InputsWithIdGroupedByType = {};
  const allowedTypesMap = indexArray(allowedTypes);

  inputResources.forEach(item => {
    if (item.resourceId) {
      const idList = convertToArray(item.resourceId);
      idList.forEach(resourceId => {
        const type = getResourceTypeFromId(resourceId);

        if (
          allowedTypesMap[kFimidaraResourceType.All] ||
          allowedTypesMap[type]
        ) {
          let inputByIdMap = inputsWithIdByType[type];

          if (!inputByIdMap) {
            inputsWithIdByType[type] = inputByIdMap = {};
          }

          inputByIdMap[resourceId] = item.action;
        }
      });
    }
  });

  return {
    inputsWithIdByType,
    allowedTypesMap,
  };
}

async function fetchResourcesById(
  idsGroupedByType: InputsWithIdGroupedByType,
  opts?: SemanticProviderOpParams
) {
  if (isObjectEmpty(idsGroupedByType)) return [];

  const promises: Array<ExtendedPromiseWithId<Resource[]>> = [];
  mapKeys(idsGroupedByType, (typeMap, type) => {
    appAssert(typeMap, 'typeMap is undefined');

    switch (type) {
      case kFimidaraResourceType.Workspace: {
        promises.push({
          id: kFimidaraResourceType.Workspace,
          promise: kSemanticModels
            .workspace()
            .getManyByIdList(Object.keys(typeMap), opts),
          resourceType: type,
        });
        break;
      }

      case kFimidaraResourceType.CollaborationRequest: {
        promises.push({
          id: kFimidaraResourceType.CollaborationRequest,
          promise: kSemanticModels
            .collaborationRequest()
            .getManyByIdList(Object.keys(typeMap), opts),
          resourceType: type,
        });
        break;
      }

      case kFimidaraResourceType.AgentToken: {
        promises.push({
          id: kFimidaraResourceType.AgentToken,
          promise: kSemanticModels
            .agentToken()
            .getManyByIdList(Object.keys(typeMap), opts),
          resourceType: type,
        });
        break;
      }

      case kFimidaraResourceType.PermissionGroup: {
        promises.push({
          id: kFimidaraResourceType.PermissionGroup,
          promise: kSemanticModels
            .permissionGroup()
            .getManyByIdList(Object.keys(typeMap), opts),
          resourceType: type,
        });
        break;
      }

      case kFimidaraResourceType.PermissionItem: {
        promises.push({
          id: kFimidaraResourceType.PermissionItem,
          promise: kSemanticModels
            .permissionItem()
            .getManyByIdList(Object.keys(typeMap), opts),
          resourceType: type,
        });
        break;
      }

      case kFimidaraResourceType.Collaborator: {
        promises.push({
          id: kFimidaraResourceType.Collaborator,
          promise: kSemanticModels
            .collaborator()
            .getManyByIdList(Object.keys(typeMap), opts),
          resourceType: type,
        });
        break;
      }
      case kFimidaraResourceType.Space: {
        promises.push({
          id: kFimidaraResourceType.Space,
          promise: kSemanticModels
            .space()
            .getManyByIdList(Object.keys(typeMap), opts),
          resourceType: type,
        });
        break;
      }

      default:
        appAssert(
          false,
          new ServerError(),
          `Unsupported resource type ${type}`
        );
    }
  });

  const resources: Array<GetResourcesResourceWrapper> = [];
  const settledPromises = await waitOnPromisesWithId(promises);

  settledPromises.forEach(item => {
    if (item.resolved) {
      item.value?.forEach(resource => {
        const action = get(idsGroupedByType, [
          item.resourceType,
          resource.resourceId,
        ]);
        resources.push({
          action,
          resource,
          resourceId: resource.resourceId,
          resourceType: item.resourceType,
        });
      });
    } else {
      throw item.reason ?? new ServerError();
    }
  });

  return resources;
}

async function authCheckResources(params: {
  agent: SessionAgent;
  workspaceId: string;
  spaceId: string;
  resources: Array<GetResourcesResourceWrapper>;
  nothrowOnCheckError?: boolean;
}) {
  const {agent, workspaceId, spaceId, resources, nothrowOnCheckError} = params;
  const results = await Promise.all(
    resources.map(resource =>
      checkAuthorizationWithAgent({
        agent,
        workspaceId,
        spaceId,
        nothrow: nothrowOnCheckError,
        target: {
          action: resource.action,
          targetId: workspaceId,
        },
      })
    )
  );

  const permitted = resources.filter(
    (resource, index) => results[index].access === kResolvedAuthCheckAccess.full
  );
  return permitted;
}
