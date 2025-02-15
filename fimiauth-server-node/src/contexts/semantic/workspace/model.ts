import {Workspace} from '../../../definitions/workspace.js';
import {DataQuery} from '../../data/types.js';
import {addIsDeletedIntoQuery} from '../SemanticBaseProvider.js';
import {SemanticWorkspaceResourceProvider} from '../SemanticWorkspaceResourceProvider.js';
import {SemanticProviderOpParams} from '../types.js';
import {getIgnoreCaseDataQueryRegExp} from '../utils.js';
import {SemanticWorkspaceProviderType} from './types.js';

export class SemanticWorkspace
  extends SemanticWorkspaceResourceProvider<Workspace>
  implements SemanticWorkspaceProviderType
{
  async workspaceExistsByName(
    name: string,
    opts?: SemanticProviderOpParams | undefined
  ): Promise<boolean> {
    const query = addIsDeletedIntoQuery<DataQuery<Workspace>>(
      {name: getIgnoreCaseDataQueryRegExp(name)},
      opts?.includeDeleted || false
    );
    return await this.data.existsByQuery(query, opts);
  }
}
