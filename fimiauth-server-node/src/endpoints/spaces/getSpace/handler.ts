import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {kUtilsInjectables} from '../../../contexts/injection/injectables.js';
import {validate} from '../../../utils/validate.js';
import {checkSpaceAuthorization03, spaceExtractor} from '../utils.js';
import {GetSpaceEndpoint} from './types.js';
import {getSpaceJoiSchema} from './validation.js';

const getSpace: GetSpaceEndpoint = async reqData => {
  const data = validate(reqData.data, getSpaceJoiSchema);
  const agent = await kUtilsInjectables
    .session()
    .getAgentFromReq(
      reqData,
      kSessionUtils.permittedAgentTypes.api,
      kSessionUtils.accessScopes.api
    );

  const {space} = await checkSpaceAuthorization03(agent, data, 'readSpace');

  return {
    space: spaceExtractor(space),
  };
};

export default getSpace;
