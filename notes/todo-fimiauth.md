# fimipost

## parts

- use ulid or nanoid or cuid for ids
- allow optional invalidate swr from caller
- workspace
  - create workspace
  - get workspaces
  - delete workspace
  - update workspace
- permission group
  - create permission group
  - get permission groups
  - delete permission group
  - update permission group
- permission
  - add permission
  - remove permission
  - get permissions
- agent
  - create agent
  - get agents
  - delete agent
  - update agent
- space
  - create space
  - get spaces
  - delete space
  - update space
  - space ID cannot be the same as workspace ID
- collaborator
  - add collaborator
  - remove collaborator
  - get collaborators
- collaboration request
  - create collaboration request
  - get collaboration requests
  - delete collaboration request
  - update collaboration request
  - respond to collaboration request
- assignments, internal
  - of permission group to agent
  - of permission group to collaboration request on accept
- compound unique constraints

## todo

- go through all endpoints and make sure they are working
  - agentTokens
  - collaborationRequests
  - permissionGroups
  - permissionItems
  - workspaces
  - collaborators
- provided id for all resources
- space
- collaborator
- use collaborator for fimiauth workspace collaborators
- check permissions using space
- add containerIds to permissions
- check permissions using containerIds
- we need a way to paginate resolveTargetChildrenAccessCheckWithAgent calls because it could potentially return a lot of results
- logic around delete space
- send email if request description changed
- targetId should be spaceId or workspaceId
- add spaceId to queueJobs
