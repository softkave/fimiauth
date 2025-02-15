import {AgentToken} from '../../definitions/agentToken.js';
import {App, AppShard} from '../../definitions/app.js';
import {AssignedItem} from '../../definitions/assignedItem.js';
import {CollaborationRequest} from '../../definitions/collaborationRequest.js';
import {Collaborator} from '../../definitions/collaborator.js';
import {EmailBlocklist, EmailMessage} from '../../definitions/email.js';
import {Job} from '../../definitions/job.js';
import {JobHistory} from '../../definitions/jobHistory.js';
import {PermissionGroup} from '../../definitions/permissionGroups.js';
import {PermissionItem} from '../../definitions/permissionItem.js';
import {Space} from '../../definitions/space.js';
import {ResourceWrapper} from '../../definitions/system.js';
import {Workspace} from '../../definitions/workspace.js';
import {throwAgentTokenNotFound} from '../../endpoints/agentTokens/utils.js';
import {throwAssignedItemNotFound} from '../../endpoints/assignedItems/utils.js';
import {throwCollaborationRequestNotFound} from '../../endpoints/collaborationRequests/utils.js';
import {throwPermissionGroupNotFound} from '../../endpoints/permissionGroups/utils.js';
import {throwPermissionItemNotFound} from '../../endpoints/permissionItems/utils.js';
import {throwNotFound} from '../../endpoints/utils.js';
import {throwWorkspaceNotFound} from '../../endpoints/workspaces/utils.js';
import {BaseMongoDataProvider} from './BaseMongoDataProvider.js';
import {
  AgentTokenDataProvider,
  AppDataProvider,
  AppShardDataProvider,
  AssignedItemDataProvider,
  CollaborationRequestDataProvider,
  CollaboratorDataProvider,
  EmailBlocklistDataProvider,
  EmailMessageDataProvider,
  JobDataProvider,
  JobHistoryDataProvider,
  PermissionGroupDataProvider,
  PermissionItemDataProvider,
  ResourceDataProvider,
  SpaceDataProvider,
  WorkspaceDataProvider,
} from './types.js';

export class WorkspaceMongoDataProvider
  extends BaseMongoDataProvider<Workspace>
  implements WorkspaceDataProvider
{
  throwNotFound = throwWorkspaceNotFound;
}

export class PermissionItemMongoDataProvider
  extends BaseMongoDataProvider<PermissionItem>
  implements PermissionItemDataProvider
{
  throwNotFound = throwPermissionItemNotFound;
}

export class PermissionGroupMongoDataProvider
  extends BaseMongoDataProvider<PermissionGroup>
  implements PermissionGroupDataProvider
{
  throwNotFound = throwPermissionGroupNotFound;
}

export class CollaborationRequestMongoDataProvider
  extends BaseMongoDataProvider<CollaborationRequest>
  implements CollaborationRequestDataProvider
{
  throwNotFound = throwCollaborationRequestNotFound;
}

export class AssignedItemMongoDataProvider
  extends BaseMongoDataProvider<AssignedItem>
  implements AssignedItemDataProvider
{
  throwNotFound = throwAssignedItemNotFound;
}

export class AgentTokenMongoDataProvider
  extends BaseMongoDataProvider<AgentToken>
  implements AgentTokenDataProvider
{
  throwNotFound = throwAgentTokenNotFound;
}

export class ResourceMongoDataProvider
  extends BaseMongoDataProvider<ResourceWrapper>
  implements ResourceDataProvider
{
  throwNotFound = throwNotFound;
}

export class JobMongoDataProvider
  extends BaseMongoDataProvider<Job>
  implements JobDataProvider
{
  throwNotFound = throwNotFound;
}

export class AppMongoDataProvider
  extends BaseMongoDataProvider<App>
  implements AppDataProvider
{
  throwNotFound = throwNotFound;
}

export class EmailMessageMongoDataProvider
  extends BaseMongoDataProvider<EmailMessage>
  implements EmailMessageDataProvider
{
  throwNotFound = throwNotFound;
}

export class EmailBlocklistMongoDataProvider
  extends BaseMongoDataProvider<EmailBlocklist>
  implements EmailBlocklistDataProvider
{
  throwNotFound = throwNotFound;
}

export class AppShardMongoDataProvider
  extends BaseMongoDataProvider<AppShard>
  implements AppShardDataProvider
{
  throwNotFound = throwNotFound;
}

export class JobHistoryMongoDataProvider
  extends BaseMongoDataProvider<JobHistory>
  implements JobHistoryDataProvider
{
  throwNotFound = throwNotFound;
}

export class CollaboratorMongoDataProvider
  extends BaseMongoDataProvider<Collaborator>
  implements CollaboratorDataProvider
{
  throwNotFound = throwNotFound;
}

export class SpaceMongoDataProvider
  extends BaseMongoDataProvider<Space>
  implements SpaceDataProvider
{
  throwNotFound = throwNotFound;
}
