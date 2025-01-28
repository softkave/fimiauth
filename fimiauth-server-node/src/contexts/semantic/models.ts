import {App} from '../../definitions/app.js';
import {Collaborator} from '../../definitions/collaborator.js';
import {PermissionGroup} from '../../definitions/permissionGroups.js';
import {Space} from '../../definitions/space.js';
import {AppRuntimeState} from '../../definitions/system.js';
import {DataSemanticBaseProvider} from './DataSemanticDataAccessBaseProvider.js';
import {DataSemanticWorkspaceResourceProvider} from './DataSemanticDataAccessWorkspaceResourceProvider.js';
import {
  SemanticAppProvider,
  SemanticAppRuntimeStateProvider,
  SemanticCollaboratorProvider,
  SemanticPermissionGroupProviderType,
  SemanticSpaceProvider,
} from './types.js';

export class DataSemanticApp
  extends DataSemanticWorkspaceResourceProvider<App>
  implements SemanticAppProvider {}

export class DataSemanticPermissionGroup
  extends DataSemanticWorkspaceResourceProvider<PermissionGroup>
  implements SemanticPermissionGroupProviderType {}

export class DataSemanticAppRuntimeState
  extends DataSemanticBaseProvider<AppRuntimeState>
  implements SemanticAppRuntimeStateProvider {}

export class DataSemanticCollaborator
  extends DataSemanticWorkspaceResourceProvider<Collaborator>
  implements SemanticCollaboratorProvider {}

export class DataSemanticSpace
  extends DataSemanticWorkspaceResourceProvider<Space>
  implements SemanticSpaceProvider {}
