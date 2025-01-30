import assert from 'assert';
import {waitTimeout} from 'softkave-js-utils';
import {describe, expect, test} from 'vitest';
import {AgentToken} from '../../../definitions/agentToken.js';
import {
  FimidaraPermissionAction,
  PermissionItem,
  kFimidaraPermissionActions,
} from '../../../definitions/permissionItem.js';
import RequestData from '../../../endpoints/RequestData.js';
import {PermissionDeniedError} from '../../../endpoints/errors.js';
import {generateAndInsertAgentTokenListForTest} from '../../../endpoints/testUtils/generate/agentToken.js';
import {
  generateAndInsertAssignedItemListForTest,
  generateAndInsertPermissionGroupListForTest,
} from '../../../endpoints/testUtils/generate/permissionGroup.js';
import {generatePermissionItemForTest} from '../../../endpoints/testUtils/generate/permissionItem.js';
import {generateAndInsertSpaceListForTest} from '../../../endpoints/testUtils/generate/space.js';
import {expectErrorThrown} from '../../../endpoints/testUtils/helpers/error.js';
import {startTesting} from '../../../endpoints/testUtils/helpers/testFns.js';
import {
  insertAgentTokenForTest,
  insertWorkspaceForTest,
  mockExpressRequestWithAgentToken,
} from '../../../endpoints/testUtils/testUtils.js';
import {convertToArray} from '../../../utils/fns.js';
import {kSessionUtils} from '../../SessionContext.js';
import {
  kSemanticModels,
  kUtilsInjectables,
} from '../../injection/injectables.js';
import {
  checkAuthorizationWithAgent,
  kResolvedAuthCheckAccess,
  resolveTargetChildrenAccessCheckWithAgent,
} from '../checkAuthorizaton.js';

startTesting();

describe('checkAuthorization', () => {
  test('check auth with target + entity, access & no access', async () => {
    const {rawWorkspace, agentToken: createdBy} =
      await generateWorkspaceAndSessionAgent();
    const {sessionAgent: user02SessionAgent, rawToken: agent02} =
      await generateAgentTokenAndSessionAgent({
        workspaceId: rawWorkspace.resourceId,
        createdBy,
      });
    const [space01, space02, space03] = await generateAndInsertSpaceListForTest(
      {
        count: 3,
        seed: {workspaceId: rawWorkspace.resourceId},
      }
    );

    await Promise.all([
      addPermissions(
        rawWorkspace.resourceId,
        agent02.resourceId,
        kFimidaraPermissionActions.readSpace,
        {targetId: space01.resourceId}
      ),
      addPermissions(
        rawWorkspace.resourceId,
        agent02.resourceId,
        kFimidaraPermissionActions.readSpace,
        {targetId: space03.resourceId, access: false}
      ),
    ]);

    await checkAuthorizationWithAgent({
      agent: user02SessionAgent,
      target: {
        action: kFimidaraPermissionActions.readSpace,
        targetId: space01.resourceId,
      },
      workspaceId: rawWorkspace.resourceId,
      spaceId: rawWorkspace.spaceId,
      workspace: rawWorkspace,
    });
    await expectErrorThrown(async () => {
      await checkAuthorizationWithAgent({
        agent: user02SessionAgent,
        target: {
          action: kFimidaraPermissionActions.readSpace,
          targetId: space02.resourceId,
        },
        workspaceId: rawWorkspace.resourceId,
        spaceId: rawWorkspace.spaceId,
        workspace: rawWorkspace,
      });
    }, [PermissionDeniedError.name]);
    await expectErrorThrown(async () => {
      await checkAuthorizationWithAgent({
        agent: user02SessionAgent,
        target: {
          action: kFimidaraPermissionActions.readSpace,
          targetId: space03.resourceId,
        },
        workspaceId: rawWorkspace.resourceId,
        spaceId: rawWorkspace.spaceId,
        workspace: rawWorkspace,
      });
    }, [PermissionDeniedError.name]);
  });

  test('check auth with target + inherited entity, access & no access', async () => {
    const {rawWorkspace, agentToken: createdBy} =
      await generateWorkspaceAndSessionAgent();
    const {sessionAgent: user02SessionAgent, rawToken: agent02} =
      await generateAgentTokenAndSessionAgent({
        workspaceId: rawWorkspace.resourceId,
        createdBy,
      });
    const [[space01, space02, space03, space04], [pg01, pg02]] =
      await Promise.all([
        generateAndInsertSpaceListForTest({
          count: 4,
          seed: {workspaceId: rawWorkspace.resourceId},
        }),
        generateAndInsertPermissionGroupListForTest(2, {
          workspaceId: rawWorkspace.resourceId,
        }),
      ]);

    await Promise.all([
      // Add readSpace access to space01 for pg01
      addPermissions(
        rawWorkspace.resourceId,
        pg01.resourceId,
        kFimidaraPermissionActions.readSpace,
        {targetId: space01.resourceId}
      ),
      // Add readSpace access to space02 for pg02
      addPermissions(
        rawWorkspace.resourceId,
        pg02.resourceId,
        kFimidaraPermissionActions.readSpace,
        {targetId: space02.resourceId}
      ),
      // Add deny readSpace access to space04 for pg01
      addPermissions(
        rawWorkspace.resourceId,
        pg02.resourceId,
        kFimidaraPermissionActions.readSpace,
        {targetId: space04.resourceId, access: false}
      ),
      // Assign pg02 to pg01
      generateAndInsertAssignedItemListForTest(1, {
        workspaceId: rawWorkspace.resourceId,
        assignedItemId: pg02.resourceId,
        assigneeId: pg01.resourceId,
      }),
      // Assign pg01 to user02
      generateAndInsertAssignedItemListForTest(1, {
        workspaceId: rawWorkspace.resourceId,
        assignedItemId: pg01.resourceId,
        assigneeId: agent02.resourceId,
      }),
    ]);

    await checkAuthorizationWithAgent({
      agent: user02SessionAgent,
      target: {
        targetId: space01.resourceId,
        action: kFimidaraPermissionActions.readSpace,
      },
      workspaceId: rawWorkspace.resourceId,
      spaceId: rawWorkspace.spaceId,
      workspace: rawWorkspace,
    });
    await checkAuthorizationWithAgent({
      agent: user02SessionAgent,
      target: {
        targetId: space02.resourceId,
        action: kFimidaraPermissionActions.readSpace,
      },
      workspaceId: rawWorkspace.resourceId,
      spaceId: rawWorkspace.spaceId,
      workspace: rawWorkspace,
    });

    await expectErrorThrown(async () => {
      await checkAuthorizationWithAgent({
        agent: user02SessionAgent,
        target: {
          targetId: space03.resourceId,
          action: kFimidaraPermissionActions.readSpace,
        },
        workspaceId: rawWorkspace.resourceId,
        spaceId: rawWorkspace.spaceId,
        workspace: rawWorkspace,
      });
    }, [PermissionDeniedError.name]);
    await expectErrorThrown(async () => {
      await checkAuthorizationWithAgent({
        agent: user02SessionAgent,
        target: {
          targetId: space04.resourceId,
          action: kFimidaraPermissionActions.readSpace,
        },
        workspaceId: rawWorkspace.resourceId,
        spaceId: rawWorkspace.spaceId,
        workspace: rawWorkspace,
      });
    }, [PermissionDeniedError.name]);
  });

  test('check auth with parent + entity, access & no access', async () => {
    const {rawWorkspace, agentToken: createdBy} =
      await generateWorkspaceAndSessionAgent();
    const {sessionAgent: user02SessionAgent, rawToken: agent02} =
      await generateAgentTokenAndSessionAgent({
        workspaceId: rawWorkspace.resourceId,
        createdBy,
      });

    const [space01, space02, space03] = await generateAndInsertSpaceListForTest(
      {
        count: 3,
        seed: {workspaceId: rawWorkspace.resourceId},
      }
    );

    const [[childAgent01], [childAgent02], [childAgent03]] = await Promise.all([
      generateAndInsertAgentTokenListForTest(1, {
        workspaceId: rawWorkspace.resourceId,
        spaceId: space01.resourceId,
      }),
      generateAndInsertAgentTokenListForTest(1, {
        workspaceId: rawWorkspace.resourceId,
        spaceId: space02.resourceId,
      }),
      generateAndInsertAgentTokenListForTest(1, {
        workspaceId: rawWorkspace.resourceId,
        spaceId: space03.resourceId,
      }),
    ]);

    await Promise.all([
      addPermissions(
        rawWorkspace.resourceId,
        agent02.resourceId,
        kFimidaraPermissionActions.wildcard,
        {targetId: space01.resourceId}
      ),
      addPermissions(
        rawWorkspace.resourceId,
        agent02.resourceId,
        kFimidaraPermissionActions.wildcard,
        {targetId: space03.resourceId, access: false}
      ),
    ]);

    await checkAuthorizationWithAgent({
      agent: user02SessionAgent,
      target: {
        action: kFimidaraPermissionActions.readAgentToken,
        targetId: childAgent01.resourceId,
      },
      workspaceId: rawWorkspace.resourceId,
      spaceId: space01.resourceId,
      workspace: rawWorkspace,
    });
    await expectErrorThrown(async () => {
      await checkAuthorizationWithAgent({
        agent: user02SessionAgent,
        target: {
          action: kFimidaraPermissionActions.readAgentToken,
          targetId: childAgent02.resourceId,
        },
        workspaceId: rawWorkspace.resourceId,
        spaceId: space02.resourceId,
        workspace: rawWorkspace,
      });
    }, [PermissionDeniedError.name]);
    await expectErrorThrown(async () => {
      await checkAuthorizationWithAgent({
        agent: user02SessionAgent,
        target: {
          action: kFimidaraPermissionActions.readAgentToken,
          targetId: childAgent03.resourceId,
        },
        workspaceId: rawWorkspace.resourceId,
        spaceId: space03.resourceId,
        workspace: rawWorkspace,
      });
    }, [PermissionDeniedError.name]);
  });

  test('check auth with parent + inherited entity, access & no access', async () => {
    const {rawWorkspace, agentToken: createdBy} =
      await generateWorkspaceAndSessionAgent();
    const {sessionAgent: user02SessionAgent, rawToken: agent02} =
      await generateAgentTokenAndSessionAgent({
        workspaceId: rawWorkspace.resourceId,
        createdBy,
      });

    const [[space01, space02, space03, space04], [pg01, pg02]] =
      await Promise.all([
        generateAndInsertSpaceListForTest({
          count: 4,
          seed: {workspaceId: rawWorkspace.resourceId},
        }),
        generateAndInsertPermissionGroupListForTest(2, {
          workspaceId: rawWorkspace.resourceId,
        }),
      ]);

    const [[childAgent01], [childAgent02], [childAgent03], [childAgent04]] =
      await Promise.all([
        generateAndInsertAgentTokenListForTest(1, {
          workspaceId: rawWorkspace.resourceId,
          spaceId: space01.resourceId,
        }),
        generateAndInsertAgentTokenListForTest(1, {
          workspaceId: rawWorkspace.resourceId,
          spaceId: space02.resourceId,
        }),
        generateAndInsertAgentTokenListForTest(1, {
          workspaceId: rawWorkspace.resourceId,
          spaceId: space03.resourceId,
        }),
        generateAndInsertAgentTokenListForTest(1, {
          workspaceId: rawWorkspace.resourceId,
          spaceId: space04.resourceId,
        }),
      ]);

    await Promise.all([
      addPermissions(
        rawWorkspace.resourceId,
        pg01.resourceId,
        kFimidaraPermissionActions.wildcard,
        {targetId: space01.resourceId}
      ),
      addPermissions(
        rawWorkspace.resourceId,
        pg02.resourceId,
        kFimidaraPermissionActions.wildcard,
        {targetId: space02.resourceId}
      ),
      addPermissions(
        rawWorkspace.resourceId,
        pg02.resourceId,
        kFimidaraPermissionActions.wildcard,
        {targetId: space04.resourceId, access: false}
      ),
      // Assign pg02 to pg01
      generateAndInsertAssignedItemListForTest(1, {
        workspaceId: rawWorkspace.resourceId,
        assignedItemId: pg02.resourceId,
        assigneeId: pg01.resourceId,
      }),
      // Assign pg01 to agent02
      generateAndInsertAssignedItemListForTest(1, {
        workspaceId: rawWorkspace.resourceId,
        assignedItemId: pg01.resourceId,
        assigneeId: agent02.resourceId,
      }),
    ]);

    await checkAuthorizationWithAgent({
      agent: user02SessionAgent,
      target: {
        action: kFimidaraPermissionActions.readAgentToken,
        targetId: childAgent01.resourceId,
      },
      workspaceId: rawWorkspace.resourceId,
      spaceId: space01.resourceId,
      workspace: rawWorkspace,
    });
    await checkAuthorizationWithAgent({
      agent: user02SessionAgent,
      target: {
        action: kFimidaraPermissionActions.readAgentToken,
        targetId: childAgent02.resourceId,
      },
      workspaceId: rawWorkspace.resourceId,
      spaceId: space02.resourceId,
      workspace: rawWorkspace,
    });

    await expectErrorThrown(async () => {
      await checkAuthorizationWithAgent({
        agent: user02SessionAgent,
        target: {
          action: kFimidaraPermissionActions.readAgentToken,
          targetId: childAgent03.resourceId,
        },
        workspaceId: rawWorkspace.resourceId,
        spaceId: space03.resourceId,
        workspace: rawWorkspace,
      });
    }, [PermissionDeniedError.name]);
    await expectErrorThrown(async () => {
      await checkAuthorizationWithAgent({
        agent: user02SessionAgent,
        target: {
          action: kFimidaraPermissionActions.readAgentToken,
          targetId: childAgent04.resourceId,
        },
        workspaceId: rawWorkspace.resourceId,
        spaceId: space04.resourceId,
        workspace: rawWorkspace,
      });
    }, [PermissionDeniedError.name]);
  });

  test('no throw', async () => {
    const {rawWorkspace, agentToken: createdBy} =
      await generateWorkspaceAndSessionAgent();
    const {sessionAgent: user02SessionAgent, rawToken: agent02} =
      await generateAgentTokenAndSessionAgent({
        workspaceId: rawWorkspace.resourceId,
        createdBy,
      });

    const [space01, space02] = await generateAndInsertSpaceListForTest({
      count: 2,
      seed: {workspaceId: rawWorkspace.resourceId},
    });

    await Promise.all([
      addPermissions(
        rawWorkspace.resourceId,
        agent02.resourceId,
        kFimidaraPermissionActions.wildcard,
        {targetId: space01.resourceId}
      ),
      addPermissions(
        rawWorkspace.resourceId,
        agent02.resourceId,
        kFimidaraPermissionActions.wildcard,
        {targetId: space02.resourceId, access: false}
      ),
    ]);

    const [check01] = await checkAuthorizationWithAgent({
      agent: user02SessionAgent,
      target: {
        action: kFimidaraPermissionActions.readSpace,
        targetId: space01.resourceId,
      },
      workspaceId: rawWorkspace.resourceId,
      spaceId: rawWorkspace.spaceId,
      workspace: rawWorkspace,
      nothrow: true,
    });
    const [check02] = await checkAuthorizationWithAgent({
      agent: user02SessionAgent,
      target: {
        action: kFimidaraPermissionActions.readSpace,
        targetId: space02.resourceId,
      },
      workspaceId: rawWorkspace.resourceId,
      spaceId: rawWorkspace.spaceId,
      workspace: rawWorkspace,
      nothrow: true,
    });

    expect(check01.hasAccess).toBeTruthy();
    expect(check01.item).toBeTruthy();
    expect(check02.hasAccess).toBeFalsy();
    expect(check02.item).toBeTruthy();
  });

  test('wildcard', async () => {
    const {rawWorkspace, agentToken: createdBy} =
      await generateWorkspaceAndSessionAgent();
    const {sessionAgent: user02SessionAgent, rawToken: agent02} =
      await generateAgentTokenAndSessionAgent({
        workspaceId: rawWorkspace.resourceId,
        createdBy,
      });

    const [space01, space02] = await generateAndInsertSpaceListForTest({
      count: 2,
      seed: {workspaceId: rawWorkspace.resourceId},
    });

    await Promise.all([
      addPermissions(
        rawWorkspace.resourceId,
        agent02.resourceId,
        kFimidaraPermissionActions.wildcard,
        {targetId: space01.resourceId}
      ),
      addPermissions(
        rawWorkspace.resourceId,
        agent02.resourceId,
        kFimidaraPermissionActions.wildcard,
        {targetId: space02.resourceId, access: false}
      ),
    ]);

    await checkAuthorizationWithAgent({
      agent: user02SessionAgent,
      target: {
        action: kFimidaraPermissionActions.readSpace,
        targetId: space01.resourceId,
      },
      workspaceId: rawWorkspace.resourceId,
      spaceId: rawWorkspace.spaceId,
      workspace: rawWorkspace,
    });
    await expectErrorThrown(async () => {
      await checkAuthorizationWithAgent({
        agent: user02SessionAgent,
        target: {
          action: kFimidaraPermissionActions.readSpace,
          targetId: space02.resourceId,
        },
        workspaceId: rawWorkspace.resourceId,
        spaceId: rawWorkspace.spaceId,
        workspace: rawWorkspace,
      });
    }, [PermissionDeniedError.name]);
  });

  test('entity > inherited entity weight', async () => {
    const {rawWorkspace, agentToken: createdBy} =
      await generateWorkspaceAndSessionAgent();
    const {sessionAgent: user02SessionAgent, rawToken: agent02} =
      await generateAgentTokenAndSessionAgent({
        workspaceId: rawWorkspace.resourceId,
        createdBy,
      });

    const [[space01], [pg01]] = await Promise.all([
      generateAndInsertSpaceListForTest({
        count: 1,
        seed: {workspaceId: rawWorkspace.resourceId},
      }),
      generateAndInsertPermissionGroupListForTest(1, {
        workspaceId: rawWorkspace.resourceId,
      }),
    ]);

    await Promise.all([
      addPermissions(
        rawWorkspace.resourceId,
        agent02.resourceId,
        kFimidaraPermissionActions.readSpace,
        {targetId: space01.resourceId}
      ),
      addPermissions(
        rawWorkspace.resourceId,
        pg01.resourceId,
        kFimidaraPermissionActions.readSpace,
        {targetId: space01.resourceId, access: false}
      ),
      // Assign pg01 to user02
      generateAndInsertAssignedItemListForTest(1, {
        workspaceId: rawWorkspace.resourceId,
        assignedItemId: pg01.resourceId,
        assigneeId: agent02.resourceId,
      }),
    ]);

    await checkAuthorizationWithAgent({
      agent: user02SessionAgent,
      target: {
        targetId: space01.resourceId,
        action: kFimidaraPermissionActions.readSpace,
      },
      workspaceId: rawWorkspace.resourceId,
      spaceId: rawWorkspace.spaceId,
      workspace: rawWorkspace,
    });
  });

  test('target > parent weight', async () => {
    const {rawWorkspace, agentToken: createdBy} =
      await generateWorkspaceAndSessionAgent();
    const {sessionAgent: user02SessionAgent, rawToken: agent02} =
      await generateAgentTokenAndSessionAgent({
        workspaceId: rawWorkspace.resourceId,
        createdBy,
      });

    const [space01] = await generateAndInsertSpaceListForTest({
      count: 1,
      seed: {workspaceId: rawWorkspace.resourceId},
    });

    const [[childAgent01]] = await Promise.all([
      generateAndInsertAgentTokenListForTest(1, {
        workspaceId: rawWorkspace.resourceId,
        spaceId: space01.resourceId,
      }),
    ]);

    await Promise.all([
      addPermissions(
        rawWorkspace.resourceId,
        agent02.resourceId,
        kFimidaraPermissionActions.readAgentToken,
        {targetId: childAgent01.resourceId}
      ),
      addPermissions(
        rawWorkspace.resourceId,
        agent02.resourceId,
        kFimidaraPermissionActions.readAgentToken,
        {targetId: space01.resourceId, access: false}
      ),
    ]);

    await checkAuthorizationWithAgent({
      agent: user02SessionAgent,
      target: {
        action: kFimidaraPermissionActions.readAgentToken,
        targetId: childAgent01.resourceId,
      },
      workspaceId: rawWorkspace.resourceId,
      spaceId: space01.resourceId,
      workspace: rawWorkspace,
    });
  });

  test('date weight', async () => {
    const {rawWorkspace, agentToken: createdBy} =
      await generateWorkspaceAndSessionAgent();
    const {sessionAgent: user02SessionAgent, rawToken: agent02} =
      await generateAgentTokenAndSessionAgent({
        workspaceId: rawWorkspace.resourceId,
        createdBy,
      });

    const [space01] = await generateAndInsertSpaceListForTest({
      count: 1,
      seed: {workspaceId: rawWorkspace.resourceId},
    });

    await addPermissions(
      rawWorkspace.resourceId,
      agent02.resourceId,
      kFimidaraPermissionActions.readSpace,
      {targetId: space01.resourceId, access: false}
    );
    await waitTimeout(/** ms */ 50);

    // Assign allow permission which should override deny permission
    await addPermissions(
      rawWorkspace.resourceId,
      agent02.resourceId,
      kFimidaraPermissionActions.readSpace,
      {targetId: space01.resourceId, access: true}
    );

    await checkAuthorizationWithAgent({
      agent: user02SessionAgent,
      target: {
        action: kFimidaraPermissionActions.readSpace,
        targetId: space01.resourceId,
      },
      workspaceId: rawWorkspace.resourceId,
      spaceId: rawWorkspace.spaceId,
      workspace: rawWorkspace,
    });
  });

  test('resolve target children full access', async () => {
    const {rawWorkspace} = await generateWorkspaceAndSessionAgent();
    const {user: user02, sessionAgent: user02SessionAgent} =
      await generateUserAndAddToWorkspace(rawWorkspace.resourceId);
    const [folder01] = await generateAndInsertTestFolders(1, {
      workspaceId: rawWorkspace.resourceId,
      parentId: null,
    });
    await Promise.all([
      addPermissions(
        rawWorkspace.resourceId,
        user02.resourceId,
        kFimidaraPermissionActions.readFile,
        {targetId: folder01.resourceId}
      ),
    ]);

    const resolveResult = await resolveTargetChildrenAccessCheckWithAgent({
      agent: user02SessionAgent,
      target: {
        action: kFimidaraPermissionActions.readFile,
        targetId: getFilePermissionContainers(
          rawWorkspace.resourceId,
          folder01,
          true
        ),
      },
      workspaceId: rawWorkspace.resourceId,
      workspace: rawWorkspace,
    });

    assert(resolveResult.access === kResolvedAuthCheckAccess.full);
    expect(resolveResult.item).toBeTruthy();
    expect(resolveResult.partialDenyIds.length).toBe(0);
    expect(resolveResult.partialDenyItems.length).toBe(0);
  });

  test('resolve target children no access', async () => {
    const {rawWorkspace} = await generateWorkspaceAndSessionAgent();
    const {user: user02, sessionAgent: user02SessionAgent} =
      await generateUserAndAddToWorkspace(rawWorkspace.resourceId);
    const [folder01, folder02] = await generateAndInsertTestFolders(2, {
      workspaceId: rawWorkspace.resourceId,
      parentId: null,
    });
    await Promise.all([
      addPermissions(
        rawWorkspace.resourceId,
        user02.resourceId,
        kFimidaraPermissionActions.readFile,
        {targetId: folder01.resourceId, access: false}
      ),
    ]);

    const resolveResult01 = await resolveTargetChildrenAccessCheckWithAgent({
      agent: user02SessionAgent,
      target: {
        action: kFimidaraPermissionActions.readFile,
        targetId: getFilePermissionContainers(
          rawWorkspace.resourceId,
          folder01,
          true
        ),
      },
      workspaceId: rawWorkspace.resourceId,
      workspace: rawWorkspace,
    });
    const resolveResult02 = await resolveTargetChildrenAccessCheckWithAgent({
      agent: user02SessionAgent,
      target: {
        action: kFimidaraPermissionActions.readFile,
        targetId: getFilePermissionContainers(
          rawWorkspace.resourceId,
          folder02,
          true
        ),
      },
      workspaceId: rawWorkspace.resourceId,
      workspace: rawWorkspace,
    });

    assert(resolveResult01.access === kResolvedAuthCheckAccess.deny);
    expect(resolveResult01.item).toBeTruthy();

    assert(resolveResult02.access === kResolvedAuthCheckAccess.partial);
    expect(resolveResult02.item).toBeFalsy();
    expect(resolveResult02.partialAllowIds.length).toBe(0);
    expect(resolveResult02.partialAllowItems.length).toBe(0);
  });

  test('resolve target children partial access', async () => {
    const {rawWorkspace} = await generateWorkspaceAndSessionAgent();
    const {user: user02, sessionAgent: user02SessionAgent} =
      await generateUserAndAddToWorkspace(rawWorkspace.resourceId);
    const [folder01] = await generateAndInsertTestFolders(1, {
      workspaceId: rawWorkspace.resourceId,
      parentId: null,
    });
    const [[file01, file02]] = await Promise.all([
      generateAndInsertTestFiles(2, {
        workspaceId: rawWorkspace.resourceId,
        parentId: folder01.resourceId,
      }),
    ]);
    await Promise.all([
      addPermissions(
        rawWorkspace.resourceId,
        user02.resourceId,
        kFimidaraPermissionActions.readFile,
        {targetId: file01.resourceId, containerId: folder01.resourceId}
      ),
      addPermissions(
        rawWorkspace.resourceId,
        user02.resourceId,
        kFimidaraPermissionActions.readFile,
        {
          targetId: file02.resourceId,
          access: false,
          containerId: folder01.resourceId,
        }
      ),
    ]);

    const resolveResult = await resolveTargetChildrenAccessCheckWithAgent({
      agent: user02SessionAgent,
      target: {
        action: kFimidaraPermissionActions.readFile,
        targetId: getFilePermissionContainers(
          rawWorkspace.resourceId,
          folder01,
          true
        ),
      },
      workspaceId: rawWorkspace.resourceId,
      workspace: rawWorkspace,
    });

    assert(resolveResult.access === kResolvedAuthCheckAccess.partial);
    expect(resolveResult.item).toBeFalsy();
    expect(resolveResult.partialAllowIds?.length).toBe(1);
    expect(resolveResult.partialAllowItems?.length).toBe(1);
    expect(resolveResult.partialAllowIds).toContain(file01.resourceId);
  });

  test('resolve target children partial access with parent deny and some children access', async () => {
    const {rawWorkspace} = await generateWorkspaceAndSessionAgent();
    const {user: user02, sessionAgent: user02SessionAgent} =
      await generateUserAndAddToWorkspace(rawWorkspace.resourceId);
    const [folder01] = await generateAndInsertTestFolders(1, {
      workspaceId: rawWorkspace.resourceId,
      parentId: null,
    });
    const [[file01]] = await Promise.all([
      generateAndInsertTestFiles(2, {
        workspaceId: rawWorkspace.resourceId,
        parentId: folder01.resourceId,
      }),
    ]);
    await Promise.all([
      addPermissions(
        rawWorkspace.resourceId,
        user02.resourceId,
        kFimidaraPermissionActions.readFile,
        {targetId: file01.resourceId, containerId: folder01.resourceId}
      ),
      addPermissions(
        rawWorkspace.resourceId,
        user02.resourceId,
        kFimidaraPermissionActions.readFile,
        {targetId: folder01.resourceId, access: false}
      ),
    ]);

    const resolveResult = await resolveTargetChildrenAccessCheckWithAgent({
      agent: user02SessionAgent,
      target: {
        action: kFimidaraPermissionActions.readFile,
        targetId: getFilePermissionContainers(
          rawWorkspace.resourceId,
          folder01,
          true
        ),
      },
      workspaceId: rawWorkspace.resourceId,
      workspace: rawWorkspace,
    });

    expect(resolveResult.access).toBe(kResolvedAuthCheckAccess.partial);
    assert(resolveResult.access === kResolvedAuthCheckAccess.partial);
    expect(resolveResult.item).toBeFalsy();
    expect(resolveResult.partialAllowIds?.length).toBe(1);
    expect(resolveResult.partialAllowItems?.length).toBe(1);
    expect(resolveResult.partialAllowIds).toContain(file01.resourceId);
  });

  test('resolve target children partial access with parent allow and some children deny', async () => {
    const {rawWorkspace} = await generateWorkspaceAndSessionAgent();
    const {user: user02, sessionAgent: user02SessionAgent} =
      await generateUserAndAddToWorkspace(rawWorkspace.resourceId);
    const [folder01] = await generateAndInsertTestFolders(1, {
      workspaceId: rawWorkspace.resourceId,
      parentId: null,
    });
    const [[file01]] = await Promise.all([
      generateAndInsertTestFiles(2, {
        workspaceId: rawWorkspace.resourceId,
        parentId: folder01.resourceId,
      }),
    ]);
    await Promise.all([
      addPermissions(
        rawWorkspace.resourceId,
        user02.resourceId,
        kFimidaraPermissionActions.readFile,
        {
          targetId: file01.resourceId,
          access: false,
          containerId: folder01.resourceId,
        }
      ),
      addPermissions(
        rawWorkspace.resourceId,
        user02.resourceId,
        kFimidaraPermissionActions.readFile,
        {targetId: folder01.resourceId}
      ),
    ]);

    const resolveResult = await resolveTargetChildrenAccessCheckWithAgent({
      agent: user02SessionAgent,
      target: {
        action: kFimidaraPermissionActions.readFile,
        targetId: getFilePermissionContainers(
          rawWorkspace.resourceId,
          folder01,
          true
        ),
      },
      workspaceId: rawWorkspace.resourceId,
      workspace: rawWorkspace,
    });

    assert(resolveResult.access === kResolvedAuthCheckAccess.full);
    expect(resolveResult.item).toBeTruthy();
    expect(resolveResult.partialDenyIds?.length).toBe(1);
    expect(resolveResult.partialDenyItems?.length).toBe(1);
    expect(resolveResult.partialDenyIds).toContain(file01.resourceId);
  });

  test('returns correct access permission', async () => {
    const {rawWorkspace, agentToken: createdBy} =
      await generateWorkspaceAndSessionAgent();
    const {sessionAgent: user02SessionAgent, rawToken: agent02} =
      await generateAgentTokenAndSessionAgent({
        workspaceId: rawWorkspace.resourceId,
        createdBy,
      });

    const [space01] = await generateAndInsertSpaceListForTest({
      count: 1,
      seed: {workspaceId: rawWorkspace.resourceId},
    });

    const [pItem01] = await addPermissions(
      rawWorkspace.resourceId,
      agent02.resourceId,
      kFimidaraPermissionActions.readSpace,
      {targetId: space01.resourceId}
    );

    const [checkResult] = await checkAuthorizationWithAgent({
      agent: user02SessionAgent,
      target: {
        action: kFimidaraPermissionActions.readSpace,
        targetId: space01.resourceId,
      },
      workspaceId: rawWorkspace.resourceId,
      spaceId: rawWorkspace.spaceId,
      workspace: rawWorkspace,
    });

    expect(checkResult.hasAccess).toBeTruthy();
    expect(checkResult.item?.resourceId).toBe(pItem01.resourceId);
  });
});

async function addPermissions(
  workspaceId: string,
  entityId: string,
  permissions: FimidaraPermissionAction | FimidaraPermissionAction[],
  other?: Partial<PermissionItem>
) {
  const items = convertToArray(permissions).map(action => {
    return generatePermissionItemForTest({
      action,
      access: true,
      targetId: workspaceId,
      entityId,
      ...other,
    });
  });

  await kSemanticModels
    .utils()
    .withTxn(opts => kSemanticModels.permissionItem().insertItem(items, opts));

  return items;
}

async function generateWorkspaceAndSessionAgent() {
  const workspaceResult = await insertWorkspaceForTest();
  const sessionAgent = await kUtilsInjectables
    .session()
    .getAgentFromReq(
      RequestData.fromExpressRequest(
        mockExpressRequestWithAgentToken(workspaceResult.agentToken)
      ),
      kSessionUtils.permittedAgentTypes.api,
      kSessionUtils.accessScopes.api
    );

  return {...workspaceResult, sessionAgent};
}

async function generateAgentTokenAndSessionAgent(params: {
  workspaceId: string;
  createdBy: AgentToken;
}) {
  const {workspaceId, createdBy} = params;
  const tokenResult = await insertAgentTokenForTest(createdBy, workspaceId);
  const sessionAgent = await kUtilsInjectables
    .session()
    .getAgentFromReq(
      RequestData.fromExpressRequest(
        mockExpressRequestWithAgentToken(tokenResult.rawToken)
      ),
      kSessionUtils.permittedAgentTypes.api,
      kSessionUtils.accessScopes.api
    );

  return {...tokenResult, sessionAgent};
}
