import assert from "assert";
import { drizzle } from "drizzle-orm/node-postgres";
import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

const dbURL = process.env.PG_DATABASE_URL;
assert.ok(dbURL, "PG_DATABASE_URL is required");

export const db = drizzle(dbURL);

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  username: text("username").unique(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ]
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    {
      compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    },
  ]
);

export const workspace = pgTable("workspace", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  lastUpdatedAt: timestamp("lastUpdatedAt", { mode: "date" }).notNull(),
  lastUpdatedBy: text("lastUpdatedBy").notNull(),
  createdBy: text("createdBy").notNull(),
});

export const space = pgTable("space", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  workspaceId: text("workspaceId")
    .notNull()
    .references(() => workspace.id, { onDelete: "cascade" }),
  providedId: text("providedId"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  lastUpdatedAt: timestamp("lastUpdatedAt", { mode: "date" }).notNull(),
  lastUpdatedBy: text("lastUpdatedBy").notNull(),
  createdBy: text("createdBy").notNull(),
});

export const agent = pgTable("agent", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  workspaceId: text("workspaceId")
    .notNull()
    .references(() => workspace.id, { onDelete: "cascade" }),
  providedId: text("providedId"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  lastUpdatedAt: timestamp("lastUpdatedAt", { mode: "date" }).notNull(),
  lastUpdatedBy: text("lastUpdatedBy").notNull(),
  createdBy: text("createdBy").notNull(),
  spaceId: text("spaceId")
    .notNull()
    .references(() => space.id, { onDelete: "cascade" }),
  spaceType: text("spaceType").notNull(),
});

export const permissionGroup = pgTable("permissionGroup", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  workspaceId: text("workspaceId")
    .notNull()
    .references(() => workspace.id, { onDelete: "cascade" }),
  providedId: text("providedId"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  lastUpdatedAt: timestamp("lastUpdatedAt", { mode: "date" }).notNull(),
  lastUpdatedBy: text("lastUpdatedBy").notNull(),
  createdBy: text("createdBy").notNull(),
  spaceId: text("spaceId")
    .notNull()
    .references(() => space.id, { onDelete: "cascade" }),
  spaceType: text("spaceType").notNull(),
});

export const permission = pgTable("permission", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  description: text("description"),
  entityId: text("entityId").notNull(),
  entityType: text("entityType").notNull(),
  action: text("action").notNull(),
  access: boolean("access").notNull(),
  target: text("target").notNull(),
  targetType: text("targetType").notNull(),
  workspaceId: text("workspaceId")
    .notNull()
    .references(() => workspace.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  lastUpdatedAt: timestamp("lastUpdatedAt", { mode: "date" }).notNull(),
  lastUpdatedBy: text("lastUpdatedBy").notNull(),
  createdBy: text("createdBy").notNull(),
  spaceId: text("spaceId")
    .notNull()
    .references(() => space.id, { onDelete: "cascade" }),
  spaceType: text("spaceType").notNull(),
});

export const collaborator = pgTable("collaborator", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  providedId: text("providedId").notNull(),
  type: text("type").notNull(),
  workspaceId: text("workspaceId")
    .notNull()
    .references(() => workspace.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  lastUpdatedAt: timestamp("lastUpdatedAt", { mode: "date" }).notNull(),
  lastUpdatedBy: text("lastUpdatedBy").notNull(),
  createdBy: text("createdBy").notNull(),
  spaceId: text("spaceId")
    .notNull()
    .references(() => space.id, { onDelete: "cascade" }),
  spaceType: text("spaceType").notNull(),
});

export const collaborationRequest = pgTable("collaborationRequest", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  providedId: text("providedId").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull(),
  title: text("title").notNull(),
  message: text("message"),
  workspaceId: text("workspaceId")
    .notNull()
    .references(() => workspace.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  lastUpdatedAt: timestamp("lastUpdatedAt", { mode: "date" }).notNull(),
  lastUpdatedBy: text("lastUpdatedBy").notNull(),
  createdBy: text("createdBy").notNull(),
  spaceId: text("spaceId")
    .notNull()
    .references(() => space.id, { onDelete: "cascade" }),
  spaceType: text("spaceType").notNull(),
});

export const eav = pgTable("eav", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  entity: text("entity").notNull(),
  entityType: text("entityType").notNull(),
  attribute: text("attribute").notNull(),
  valueType: text("valueType").notNull(),
  value: text("value").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  lastUpdatedAt: timestamp("lastUpdatedAt", { mode: "date" }).notNull(),
  lastUpdatedBy: text("lastUpdatedBy").notNull(),
  createdBy: text("createdBy").notNull(),
});
