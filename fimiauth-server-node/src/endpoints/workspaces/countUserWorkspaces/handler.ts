import {
  kSemanticModels,
  kUtilsInjectables,
} from '../../../contexts/injection/injectables.js';
import {validate} from '../../../utils/validate.js';
import {CountUserWorkspacesEndpoint} from './types.js';
import {countUserWorkspacesJoiSchema} from './validation.js';

const countUserWorkspaces: CountUserWorkspacesEndpoint = async reqData => {
  const data = validate(reqData.data, countUserWorkspacesJoiSchema);
  await kUtilsInjectables.session().getSystemAgent(reqData);

  const count = await kSemanticModels
    .agentToken()
    .countManyByUserId(data.userId);

  return {count};
};

export default countUserWorkspaces;
