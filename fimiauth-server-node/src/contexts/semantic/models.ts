import {App} from '../../definitions/app.js';
import {PermissionGroup} from '../../definitions/permissionGroups.js';
import {AppRuntimeState} from '../../definitions/system.js';
import {DataSemanticBaseProvider} from './DataSemanticDataAccessBaseProvider.js';
import {DataSemanticWorkspaceResourceProvider} from './DataSemanticDataAccessWorkspaceResourceProvider.js';
import {
  SemanticAppProvider,
  SemanticAppRuntimeStateProvider,
  SemanticPermissionGroupProviderType,
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
