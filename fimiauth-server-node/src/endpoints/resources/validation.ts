import Joi from 'joi';
import {kValidationSchemas} from '../../utils/validationUtils.js';
import kResourcesConstants from './constants.js';
import {FetchResourceItem} from './types.js';

const fetchResourceItem = Joi.object<FetchResourceItem>().keys({
  resourceId: kValidationSchemas.resourceId,
  action: kValidationSchemas.crudAction.required(),
});

const fetchResourceItemList = Joi.array()
  .items(fetchResourceItem)
  .max(kResourcesConstants.maxFetchItems);

const kResourcesValidationSchemas = {fetchResourceItem, fetchResourceItemList};
export default kResourcesValidationSchemas;
