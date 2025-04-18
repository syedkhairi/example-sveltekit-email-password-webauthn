import { pgTable, text, integer, customType, serial, timestamp, pgPolicy, uuid, boolean, pgEnum, index, primaryKey, uniqueIndex } from 'drizzle-orm/pg-core';

const bytea = customType<{
  data: Uint8Array;
  driverData: Buffer;
}>({
  dataType() {
    return 'bytea';
  },
});

export const user = pgTable('user', {
  id: serial('id').primaryKey().notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  email: text('email').notNull().unique(),
  username: text('username').notNull(),
  name: text('name').notNull().default(''),
  password_hash: text('password_hash').notNull(),
  email_verified: integer('email_verified').notNull().default(0),
  recovery_code: bytea('recovery_code').notNull(),
}, (table) => [
    index('email_index').on(table.email)
]);

export const session = pgTable('session', {
  id: text('id').primaryKey().notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  user_id: integer('user_id').notNull().references(() => user.id),
  expires_at: integer('expires_at').notNull(),
  two_factor_verified: integer('two_factor_verified').notNull().default(0),
}, (table) => ([
    index('session_user_id_idx').on(table.user_id),
]));

export const emailVerificationRequest = pgTable('email_verification_request', {
  id: text('id').primaryKey().notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  user_id: integer('user_id').notNull().references(() => user.id),
  email: text('email').notNull(),
  code: text('code').notNull(),
  expires_at: integer('expires_at').notNull(),
}, (table) => ([
  index('email_verification_request_user_id_idx').on(table.user_id)
]));

export const passwordResetSession = pgTable('password_reset_session', {
  id: text('id').primaryKey().notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  user_id: integer('user_id').notNull().references(() => user.id),
  email: text('email').notNull(),
  code: text('code').notNull(),
  expires_at: integer('expires_at').notNull(),
  email_verified: integer('email_verified').notNull().default(0),
  two_factor_verified: integer('two_factor_verified').notNull().default(0),
}, (table) => ([
  index('password_reset_session_user_id_idx').on(table.user_id),
]));

export const totpCredential = pgTable('totp_credential', {
  id: serial('id').primaryKey().notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  user_id: integer('user_id').notNull().references(() => user.id).unique(),
  key: bytea('key').notNull(),
}, (table) => ([
  index('totp_credential_user_id_idx').on(table.user_id), // Index might be redundant due to unique constraint, but explicit doesn't hurt
]));

export const passkeyCredential = pgTable('passkey_credential', {
  id: bytea('id').primaryKey().notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  user_id: integer('user_id').notNull().references(() => user.id),
  name: text('name').notNull(),
  algorithm: integer('algorithm').notNull(),
  public_key: bytea('public_key').notNull(),
}, (table) => ([
  index('passkey_credential_user_id_idx').on(table.user_id),
]));

export const securityKeyCredential = pgTable('security_key_credential', {
  id: bytea('id').primaryKey().notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  user_id: integer('user_id').notNull().references(() => user.id),
  name: text('name').notNull(),
  algorithm: integer('algorithm').notNull(),
  public_key: bytea('public_key').notNull(),
}, (table) => ([
  index('security_key_credential_user_id_idx').on(table.user_id),
]));
