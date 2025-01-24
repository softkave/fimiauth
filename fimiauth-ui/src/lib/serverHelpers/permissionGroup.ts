import {
  db,
  eav as eavTable,
  permissionGroup as permissionGroupTable,
} from "@/src/db/schema.js";
import { kAppConstants } from "@/src/definitions/appConstants.js";
import {
  EavEntityType,
  kEavAttribute,
  kEavEntityType,
  kEavValueType,
} from "@/src/definitions/eav.js";
import {
  addPermissionGroupSchema,
  getPermissionGroupSchema,
  getPermissionGroupsSchema,
  updatePermissionGroupSchema,
} from "@/src/definitions/permissionGroup.js";
import { IActionSubject } from "@/src/definitions/resource.js";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { OwnServerError } from "../common/error.js";
import { cleanSpaceInput } from "./space.js";

export async function createPermissionGroup(params: {
  data: z.infer<typeof addPermissionGroupSchema> | (unknown & {});
  subject: IActionSubject;
}) {
  const input = addPermissionGroupSchema.parse(params.data);
  const newPermissionGroup = {
    ...cleanSpaceInput(input),
    workspaceId: input.workspaceId,
    name: input.name,
    description: input.description,
    createdAt: new Date(),
    lastUpdatedAt: new Date(),
    createdBy: params.subject.id,
    createdByType: params.subject.type,
    lastUpdatedBy: params.subject.id,
    lastUpdatedByType: params.subject.type,
  } satisfies typeof permissionGroupTable.$inferInsert;

  const permissionGroup = await db
    .insert(permissionGroupTable)
    .values(newPermissionGroup)
    .returning()
    .then(([permissionGroup]) => permissionGroup);

  return permissionGroup;
}

export async function createAdminPermissionGroup(params: {
  subject: IActionSubject;
  workspaceId: string;
}) {
  return await createPermissionGroup({
    data: {
      name: kAppConstants.permissionGroup.adminPermissionGroupName,
      description:
        kAppConstants.permissionGroup.adminPermissionGroupDescription,
      workspaceId: params.workspaceId,
    },
    subject: params.subject,
  });
}

export async function assignPermissionGroup(params: {
  pgId: string;
  entityId: string;
  entityType: EavEntityType;
  subject: IActionSubject;
  workspaceId: string;
}) {
  const newEavEntry = {
    attribute: kEavAttribute.assigned,
    entity: params.entityId,
    entityType: params.entityType,
    value: params.pgId,
    valueType: kEavValueType.permissionGroup,
    createdAt: new Date(),
    lastUpdatedAt: new Date(),
    createdBy: params.subject.id,
    createdByType: params.subject.type,
    lastUpdatedBy: params.subject.id,
    lastUpdatedByType: params.subject.type,
  } satisfies typeof eavTable.$inferInsert;

  await db.insert(eavTable).values(newEavEntry);
}

export async function getPermissionGroup(params: {
  data: z.infer<typeof getPermissionGroupSchema> | (unknown & {});
}) {
  const input = getPermissionGroupSchema.parse(params.data);

  if (input.id) {
    return await db
      .select()
      .from(permissionGroupTable)
      .where(eq(permissionGroupTable.id, input.id))
      .then(([permissionGroup]) => permissionGroup);
  } else if (input.workspaceId && (input.spaceId || input.providedId)) {
    return await db
      .select()
      .from(permissionGroupTable)
      .where(
        and(
          eq(permissionGroupTable.workspaceId, input.workspaceId),
          input.spaceId
            ? eq(permissionGroupTable.spaceId, input.spaceId)
            : undefined,
          input.providedId
            ? eq(permissionGroupTable.providedId, input.providedId)
            : undefined
        )
      )
      .then(([permissionGroup]) => permissionGroup);
  }

  throw new OwnServerError(
    "Invalid input, no id or workspaceId and spaceId or providedId provided",
    400
  );
}

export async function assertGetPermissionGroup(params: {
  data: z.infer<typeof getPermissionGroupSchema> | (unknown & {});
}) {
  const permissionGroup = await getPermissionGroup(params);
  if (!permissionGroup) {
    throw new OwnServerError("Permission group not found", 404);
  }

  return permissionGroup;
}

export async function getAssignedPermissionGroupIds(params: {
  entityId: string;
  entityType: EavEntityType;
}) {
  const eavEntries = await db
    .select()
    .from(eavTable)
    .where(
      and(
        eq(eavTable.entity, params.entityId),
        eq(eavTable.entityType, params.entityType),
        eq(eavTable.attribute, kEavAttribute.assigned),
        eq(eavTable.valueType, kEavValueType.permissionGroup)
      )
    )
    .then((eavEntries) => eavEntries.map((eavEntry) => eavEntry.value));

  return eavEntries;
}

export async function getPermissionGroups(params: {
  data: z.infer<typeof getPermissionGroupsSchema> | (unknown & {});
}) {
  const input = getPermissionGroupsSchema.parse(params.data);

  let permissionGroupIds: string[] = [];

  if (input.permissionGroupId) {
    permissionGroupIds = await getAssignedPermissionGroupIds({
      entityId: input.permissionGroupId,
      entityType: kEavEntityType.permissionGroup,
    });
  } else if (input.agentId) {
    permissionGroupIds = await getAssignedPermissionGroupIds({
      entityId: input.agentId,
      entityType: kEavEntityType.agent,
    });
  }

  const permissionGroups = await db
    .select()
    .from(permissionGroupTable)
    .where(
      and(
        eq(permissionGroupTable.workspaceId, input.workspaceId),
        permissionGroupIds.length > 0
          ? inArray(permissionGroupTable.id, permissionGroupIds)
          : undefined,
        input.spaceId
          ? eq(permissionGroupTable.spaceId, input.spaceId)
          : undefined
      )
    );

  return permissionGroups;
}

export async function updatePermissionGroup(params: {
  data: z.infer<typeof updatePermissionGroupSchema> | (unknown & {});
  permissionGroupId: string;
  subject: IActionSubject;
}) {
  const input = updatePermissionGroupSchema.parse(params.data);

  const permissionGroup = await db
    .update(permissionGroupTable)
    .set({
      ...input,
      lastUpdatedAt: new Date(),
      lastUpdatedBy: params.subject.id,
      lastUpdatedByType: params.subject.type,
    })
    .where(eq(permissionGroupTable.id, params.permissionGroupId))
    .returning()
    .then(
      ([permissionGroup]) =>
        permissionGroup as typeof permissionGroupTable.$inferSelect | null
    );

  return permissionGroup;
}

export async function deletePermissionGroup(params: {
  permissionGroupId: string;
}) {
  await db
    .delete(permissionGroupTable)
    .where(eq(permissionGroupTable.id, params.permissionGroupId));
}
