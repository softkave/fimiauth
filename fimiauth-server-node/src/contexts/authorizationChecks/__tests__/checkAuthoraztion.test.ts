import assert from 'assert';
import {waitTimeout} from 'softkave-js-utils';
import {describe, expect, test} from 'vitest';
import {
  FimidaraPermissionAction,
  PermissionItem,
  kFimidaraPermissionActions,
} from '../../../definitions/permissionItem.js';
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
  generateAgentTokenAndSessionAgent,
  generateWorkspaceAndSessionAgent,
} from '../../../endpoints/testUtils/testUtils.js';
import {convertToArray} from '../../../utils/fns.js';
import {kSemanticModels} from '../../injection/injectables.js';
import {
  checkAuthorizationWithAgent,
  kResolvedAuthCheckAccess,
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
    });
    await checkAuthorizationWithAgent({
      agent: user02SessionAgent,
      target: {
        targetId: space02.resourceId,
        action: kFimidaraPermissionActions.readSpace,
      },
      workspaceId: rawWorkspace.resourceId,
      spaceId: rawWorkspace.spaceId,
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
    });
    await checkAuthorizationWithAgent({
      agent: user02SessionAgent,
      target: {
        action: kFimidaraPermissionActions.readAgentToken,
        targetId: childAgent02.resourceId,
      },
      workspaceId: rawWorkspace.resourceId,
      spaceId: space02.resourceId,
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

    const check01 = await checkAuthorizationWithAgent({
      agent: user02SessionAgent,
      target: {
        action: kFimidaraPermissionActions.readSpace,
        targetId: space01.resourceId,
      },
      workspaceId: rawWorkspace.resourceId,
      spaceId: rawWorkspace.spaceId,
      nothrow: true,
    });
    const check02 = await checkAuthorizationWithAgent({
      agent: user02SessionAgent,
      target: {
        action: kFimidaraPermissionActions.readSpace,
        targetId: space02.resourceId,
      },
      workspaceId: rawWorkspace.resourceId,
      spaceId: rawWorkspace.spaceId,
      nothrow: true,
    });

    expect(check01.access === kResolvedAuthCheckAccess.full);
    expect(check01.item).toBeTruthy();
    expect(check02.access === kResolvedAuthCheckAccess.deny);
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
    });
  });

  test('resolve target children full access', async () => {
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

    await Promise.all([
      addPermissions(
        rawWorkspace.resourceId,
        agent02.resourceId,
        kFimidaraPermissionActions.readSpace,
        {targetId: space01.resourceId}
      ),
    ]);

    const resolveResult = await checkAuthorizationWithAgent({
      agent: user02SessionAgent,
      spaceId: rawWorkspace.spaceId,
      target: {
        action: kFimidaraPermissionActions.readSpace,
        targetId: space01.resourceId,
      },
      workspaceId: rawWorkspace.resourceId,
    });

    assert(resolveResult.access === kResolvedAuthCheckAccess.full);
    expect(resolveResult.item).toBeTruthy();
  });

  test('resolve target children no access', async () => {
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

    await Promise.all([
      addPermissions(
        rawWorkspace.resourceId,
        agent02.resourceId,
        kFimidaraPermissionActions.readSpace,
        {targetId: space01.resourceId, access: false}
      ),
    ]);

    const resolveResult01 = await checkAuthorizationWithAgent({
      agent: user02SessionAgent,
      target: {
        action: kFimidaraPermissionActions.readSpace,
        targetId: space01.resourceId,
      },
      workspaceId: rawWorkspace.resourceId,
      spaceId: rawWorkspace.spaceId,
    });
    const resolveResult02 = await checkAuthorizationWithAgent({
      agent: user02SessionAgent,
      target: {
        action: kFimidaraPermissionActions.readSpace,
        targetId: space01.resourceId,
      },
      workspaceId: rawWorkspace.resourceId,
      spaceId: rawWorkspace.spaceId,
    });

    assert(resolveResult01.access === kResolvedAuthCheckAccess.deny);
    expect(resolveResult01.item).toBeTruthy();

    assert(resolveResult02.access === kResolvedAuthCheckAccess.partial);
    expect(resolveResult02.item).toBeFalsy();
    expect(resolveResult02.allowItems.length).toBe(0);
    expect(resolveResult02.denyItems.length).toBe(1);
  });

  test('resolve target children partial access', async () => {
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
    const [[file01, file02]] = await Promise.all([
      generateAndInsertAgentTokenListForTest(2, {
        workspaceId: rawWorkspace.resourceId,
        spaceId: space01.resourceId,
      }),
    ]);
    await Promise.all([
      addPermissions(
        rawWorkspace.resourceId,
        agent02.resourceId,
        kFimidaraPermissionActions.readAgentToken,
        {targetId: file01.resourceId}
      ),
      addPermissions(
        rawWorkspace.resourceId,
        agent02.resourceId,
        kFimidaraPermissionActions.readAgentToken,
        {
          targetId: file02.resourceId,
          access: false,
        }
      ),
    ]);

    const resolveResult = await checkAuthorizationWithAgent({
      agent: user02SessionAgent,
      target: {
        action: kFimidaraPermissionActions.readAgentToken,
        targetId: space01.resourceId,
      },
      workspaceId: rawWorkspace.resourceId,
      spaceId: rawWorkspace.spaceId,
    });

    assert(resolveResult.access === kResolvedAuthCheckAccess.partial);
    expect(resolveResult.item).toBeFalsy();
    expect(resolveResult.allowItems.length).toBe(1);
    expect(resolveResult.denyItems.length).toBe(1);
    expect(resolveResult.allowItems).toContain(file01);
    expect(resolveResult.denyItems).toContain(file02);
  });

  test('resolve target children partial access with parent deny and some children access', async () => {
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
    const [[file01]] = await Promise.all([
      generateAndInsertAgentTokenListForTest(2, {
        workspaceId: rawWorkspace.resourceId,
        spaceId: space01.resourceId,
      }),
    ]);
    await Promise.all([
      addPermissions(
        rawWorkspace.resourceId,
        agent02.resourceId,
        kFimidaraPermissionActions.readAgentToken,
        {targetId: file01.resourceId}
      ),
      addPermissions(
        rawWorkspace.resourceId,
        agent02.resourceId,
        kFimidaraPermissionActions.readAgentToken,
        {targetId: space01.resourceId, access: false}
      ),
    ]);

    const resolveResult = await checkAuthorizationWithAgent({
      agent: user02SessionAgent,
      target: {
        action: kFimidaraPermissionActions.readAgentToken,
        targetId: space01.resourceId,
      },
      workspaceId: rawWorkspace.resourceId,
      spaceId: rawWorkspace.spaceId,
    });

    expect(resolveResult.access).toBe(kResolvedAuthCheckAccess.partial);
    assert(resolveResult.access === kResolvedAuthCheckAccess.partial);
    expect(resolveResult.item).toBeFalsy();
    expect(resolveResult.allowItems.length).toBe(1);
    expect(resolveResult.denyItems.length).toBe(1);
    expect(resolveResult.allowItems).toContain(file01);
  });

  test('resolve target children partial access with parent allow and some children deny', async () => {
    const {rawWorkspace, agentToken: createdBy} =
      await generateWorkspaceAndSessionAgent();
    const {sessionAgent: user02SessionAgent, rawToken: agent02} =
      await generateAgentTokenAndSessionAgent({
        workspaceId: rawWorkspace.resourceId,
        createdBy,
      });
    const [folder01] = await generateAndInsertSpaceListForTest({
      count: 1,
      seed: {workspaceId: rawWorkspace.resourceId},
    });
    const [[file01]] = await Promise.all([
      generateAndInsertAgentTokenListForTest(2, {
        workspaceId: rawWorkspace.resourceId,
        spaceId: folder01.resourceId,
      }),
    ]);
    await Promise.all([
      addPermissions(
        rawWorkspace.resourceId,
        agent02.resourceId,
        kFimidaraPermissionActions.readAgentToken,
        {
          targetId: file01.resourceId,
          access: false,
          containerId: [folder01.resourceId],
        }
      ),
      addPermissions(
        rawWorkspace.resourceId,
        agent02.resourceId,
        kFimidaraPermissionActions.readAgentToken,
        {targetId: folder01.resourceId}
      ),
    ]);

    const resolveResult = await checkAuthorizationWithAgent({
      agent: user02SessionAgent,
      target: {
        action: kFimidaraPermissionActions.readAgentToken,
        targetId: folder01.resourceId,
      },
      workspaceId: rawWorkspace.resourceId,
      spaceId: rawWorkspace.spaceId,
    });

    assert(resolveResult.access === kResolvedAuthCheckAccess.partial);
    expect(resolveResult.item).toBeTruthy();
    expect(resolveResult.denyItems.length).toBe(1);
    expect(resolveResult.denyItems).toContain(file01);
    expect(resolveResult.allowItems.length).toBe(1);
    expect(resolveResult.allowItems).toContain(file01);
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

    const checkResult = await checkAuthorizationWithAgent({
      agent: user02SessionAgent,
      target: {
        action: kFimidaraPermissionActions.readSpace,
        targetId: space01.resourceId,
      },
      workspaceId: rawWorkspace.resourceId,
      spaceId: rawWorkspace.spaceId,
    });

    expect(checkResult.access).toBe(kResolvedAuthCheckAccess.full);
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
