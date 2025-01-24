import {
  db,
  eav as eavTable,
  permissionGroup as permissionGroupTable,
} from "@/src/db/schema.js";
import { kAppConstants } from "@/src/definitions/appConstants.js";
import {
  EavEntityType,
  kEavAttribute,
  kEavValueType,
} from "@/src/definitions/eav.js";
import { addPermissionGroupSchema } from "@/src/definitions/permissionGroup.js";
import { IActionSubject } from "@/src/definitions/resource.js";
import { z } from "zod";
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
