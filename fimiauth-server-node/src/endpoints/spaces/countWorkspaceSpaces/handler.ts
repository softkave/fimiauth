import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {
  kSemanticModels,
  kUtilsInjectables,
} from '../../../contexts/injection/injectables.js';
import {validate} from '../../../utils/validate.js';
import {getWorkspaceFromEndpointInput} from '../../workspaces/utils.js';
import {getWorkspaceSpacesQuery} from '../getWorkspaceSpaces/utils.js';
import {CountWorkspaceSpacesEndpoint} from './types.js';
import {countWorkspaceSpacesJoiSchema} from './validation.js';

const countWorkspaceSpaces: CountWorkspaceSpacesEndpoint = async reqData => {
  const data = validate(reqData.data, countWorkspaceSpacesJoiSchema);
  const agent = await kUtilsInjectables
    .session()
    .getAgentFromReq(
      reqData,
      kSessionUtils.permittedAgentTypes.api,
      kSessionUtils.accessScopes.api
    );

  const {workspace} = await getWorkspaceFromEndpointInput(agent, data);
  const q = await getWorkspaceSpacesQuery(agent, workspace);
  const count = await kSemanticModels.space().countManyByWorkspaceAndIdList(q);

  return {count};
};

export default countWorkspaceSpaces;
