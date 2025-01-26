import {Workspace} from '../../../definitions/workspace.js';
import {
  SemanticProviderOpParams,
  SemanticWorkspaceResourceProviderType,
} from '../types.js';

export interface SemanticWorkspaceProviderType
  extends SemanticWorkspaceResourceProviderType<Workspace> {
  workspaceExistsByName(
    name: string,
    opts?: SemanticProviderOpParams
  ): Promise<boolean>;
}
