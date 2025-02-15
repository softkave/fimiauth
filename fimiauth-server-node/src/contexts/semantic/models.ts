import {App} from '../../definitions/app.js';
import {Collaborator} from '../../definitions/collaborator.js';
import {PermissionGroup} from '../../definitions/permissionGroups.js';
import {Space} from '../../definitions/space.js';
import {SemanticWorkspaceResourceProvider} from './SemanticWorkspaceResourceProvider.js';
import {
  SemanticAppProvider,
  SemanticCollaboratorProvider,
  SemanticPermissionGroupProviderType,
  SemanticSpaceProvider,
} from './types.js';

export class SemanticApp
  extends SemanticWorkspaceResourceProvider<App>
  implements SemanticAppProvider {}

export class SemanticPermissionGroup
  extends SemanticWorkspaceResourceProvider<PermissionGroup>
  implements SemanticPermissionGroupProviderType {}

export class SemanticCollaborator
  extends SemanticWorkspaceResourceProvider<Collaborator>
  implements SemanticCollaboratorProvider {}

export class SemanticSpace
  extends SemanticWorkspaceResourceProvider<Space>
  implements SemanticSpaceProvider {}
