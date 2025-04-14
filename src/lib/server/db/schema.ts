import { pgTable, text, integer, timestamp, pgPolicy, uuid, boolean, pgEnum, index, primaryKey, uniqueIndex } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: integer('id').primaryKey().notNull(),
  email: text('email').notNull().unique(),
  username: text('username').notNull(),
  password_hash: text('password_hash').notNull(),
  email_verified: integer('email_verified').notNull().default(0),
  recovery_code: text('recovery_code').notNull(), // Changed BLOB to text for PostgreSQL
}, (table) => [
    index('email_index').on(table.email)
]);

export const session = pgTable('session', {
  id: text('id').primaryKey().notNull(),
  user_id: integer('user_id').notNull().references(() => user.id),
  expires_at: integer('expires_at').notNull(),
  two_factor_verified: integer('two_factor_verified').notNull().default(0),
});

export const emailVerificationRequest = pgTable('email_verification_request', {
  id: text('id').primaryKey().notNull(),
  user_id: integer('user_id').notNull().references(() => user.id),
  email: text('email').notNull(),
  code: text('code').notNull(),
  expires_at: integer('expires_at').notNull(),
});

export const passwordResetSession = pgTable('password_reset_session', {
  id: text('id').primaryKey().notNull(),
  user_id: integer('user_id').notNull().references(() => user.id),
  email: text('email').notNull(),
  code: text('code').notNull(),
  expires_at: integer('expires_at').notNull(),
  email_verified: integer('email_verified').notNull().default(0),
  two_factor_verified: integer('two_factor_verified').notNull().default(0),
});

export const totpCredential = pgTable('totp_credential', {
  id: integer('id').primaryKey().notNull(),
  user_id: integer('user_id').notNull().references(() => user.id).unique(),
  key: text('key').notNull(), // Changed BLOB to text for PostgreSQL
});

export const passkeyCredential = pgTable('passkey_credential', {
  id: text('id').primaryKey().notNull(), // Changed BLOB to text for PostgreSQL
  user_id: integer('user_id').notNull().references(() => user.id),
  name: text('name').notNull(),
  algorithm: integer('algorithm').notNull(),
  public_key: text('public_key').notNull(), // Changed BLOB to text for PostgreSQL
});

export const securityKeyCredential = pgTable('security_key_credential', {
  id: text('id').primaryKey().notNull(), // Changed BLOB to text for PostgreSQL
  user_id: integer('user_id').notNull().references(() => user.id),
  name: text('name').notNull(),
  algorithm: integer('algorithm').notNull(),
  public_key: text('public_key').notNull(), // Changed BLOB to text for PostgreSQL
});
