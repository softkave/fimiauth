import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {
  kSemanticModels,
  kUtilsInjectables,
} from '../../../contexts/injection/injectables.js';
import {validate} from '../../../utils/validate.js';
import {
  applyDefaultEndpointPaginationOptions,
  getEndpointPageFromInput,
} from '../../pagination.js';
import {getWorkspaceFromEndpointInput} from '../../workspaces/utils.js';
import {spaceListExtractor} from '../utils.js';
import {GetWorkspaceSpacesEndpoint} from './types.js';
import {getWorkspaceSpacesQuery} from './utils.js';
import {getWorkspaceSpacesJoiSchema} from './validation.js';

const getWorkspaceSpaces: GetWorkspaceSpacesEndpoint = async reqData => {
  const data = validate(reqData.data, getWorkspaceSpacesJoiSchema);
  const agent = await kUtilsInjectables
    .session()
    .getAgentFromReq(
      reqData,
      kSessionUtils.permittedAgentTypes.api,
      kSessionUtils.accessScopes.api
    );

  const {workspace} = await getWorkspaceFromEndpointInput(agent, data);
  const q = await getWorkspaceSpacesQuery(agent, workspace);
  applyDefaultEndpointPaginationOptions(data);
  const items = await kSemanticModels.space().getManyBySpaceAndIdList(q, data);

  return {
    page: getEndpointPageFromInput(data),
    spaces: spaceListExtractor(items),
  };
};

export default getWorkspaceSpaces;
