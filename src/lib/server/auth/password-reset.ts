import { db } from "$lib/server/db/";
import * as table from '$lib/server/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { encodeHexLowerCase } from "@oslojs/encoding";
import { generateRandomOTP } from "$lib/server/utils";
import { sha256 } from "@oslojs/crypto/sha2";

import type { RequestEvent } from "@sveltejs/kit";
import type { User } from "$lib/server/auth/user";

export async function createPasswordResetSession(token: string, userId: number, email: string): Promise<PasswordResetSession> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: PasswordResetSession = {
		id: sessionId,
		userId,
		email,
		expiresAt: new Date(Date.now() + 1000 * 60 * 10),
		code: generateRandomOTP(),
		emailVerified: false,
		twoFactorVerified: false
	};
	await db
		.insert(table.passwordResetSession)
		.values({
			id: session.id,
			user_id: session.userId,
			email: session.email,
			code: session.code,
			expires_at: Math.floor(session.expiresAt.getTime() / 1000)
		});
	return session;
}

export async function validatePasswordResetSessionToken(token: string): Promise<PasswordResetSessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const [row] = await db
		.select({
			passwordResetSession: {
				id: table.passwordResetSession.id,
				userId: table.passwordResetSession.user_id,
				email: table.passwordResetSession.email,
				code: table.passwordResetSession.code,
				expiresAt: table.passwordResetSession.expires_at,
				emailVerified: table.passwordResetSession.email_verified,
				twoFactorVerified:table. passwordResetSession.two_factor_verified,
			},
			user: {
				id: table.user.id,
				email: table.user.email,
				username: table.user.username,
				emailVerified: table.user.email_verified,
			},
			hasTOTP: sql<number>`CASE WHEN ${table.totpCredential.id} IS NOT NULL THEN 1 ELSE 0 END`,
			hasPasskey: sql<number>`CASE WHEN ${table.passkeyCredential.id} IS NOT NULL THEN 1 ELSE 0 END`,
			hasSecurityKey: sql<number>`CASE WHEN ${table.securityKeyCredential.id} IS NOT NULL THEN 1 ELSE 0 END`
		})
		.from(table.passwordResetSession)
		.innerJoin(table.user, eq(table.passwordResetSession.user_id, table.user.id))
		.leftJoin(table.totpCredential, eq(table.user.id, table.totpCredential.user_id))
		.leftJoin(table.passkeyCredential, eq(table.user.id, table.passkeyCredential.user_id))
		.leftJoin(table.securityKeyCredential, eq(table.user.id, table.securityKeyCredential.user_id))
		.where(eq(table.passwordResetSession.id, sessionId));
	if (!row) {
		return { session: null, user: null };
	}
	const session: PasswordResetSession = {
		id: row.passwordResetSession.id,
		userId: row.passwordResetSession.userId,
		email: row.passwordResetSession.email,
		code: row.passwordResetSession.code,
		expiresAt: new Date(row.passwordResetSession.expiresAt * 1000),
		emailVerified: Boolean(row.passwordResetSession.emailVerified),
		twoFactorVerified: Boolean(row.passwordResetSession.twoFactorVerified)
	};
	const user: User = {
		id: row.user.id,
		email: row.user.email,
		username: row.user.username,
		emailVerified: Boolean(row.user.emailVerified),
		registeredTOTP: Boolean(row.hasTOTP),
		registeredPasskey: Boolean(row.hasPasskey),
		registeredSecurityKey: Boolean(row.hasSecurityKey),
		registered2FA: false
	};
	if (user.registeredPasskey || user.registeredSecurityKey || user.registeredTOTP) {
		user.registered2FA = true;
	}
	if (Date.now() >= session.expiresAt.getTime()) {
		await db
			.delete(table.passwordResetSession)
			.where(eq(table.passwordResetSession.id, session.id))
		return { session: null, user: null };
	}
	return { session, user };
}

export async function setPasswordResetSessionAsEmailVerified(sessionId: string): Promise<void> {
	await db
		.update(table.passwordResetSession)
		.set({
			email_verified: 1
		})
		.where(eq(table.passwordResetSession.id, sessionId));
}

export async function setPasswordResetSessionAs2FAVerified(sessionId: string): Promise<void> {
	await db
		.update(table.passwordResetSession)
		.set({
			two_factor_verified: 1
		})
		.where(eq(table.passwordResetSession.id, sessionId));
}

export async function invalidateUserPasswordResetSessions(userId: number): Promise<void> {
	await db
		.delete(table.passwordResetSession)
		.where(eq(table.passwordResetSession.user_id, userId));
}

export async function validatePasswordResetSessionRequest(event: RequestEvent): Promise<PasswordResetSessionValidationResult> {
	const token = event.cookies.get("password_reset_session") ?? null;
	if (token === null) {
		return { session: null, user: null };
	}
	const result = await validatePasswordResetSessionToken(token);
	if (result.session === null) {
		deletePasswordResetSessionTokenCookie(event);
	}
	return result;
}

export function setPasswordResetSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date): void {
	event.cookies.set("password_reset_session", token, {
		expires: expiresAt,
		sameSite: "lax",
		httpOnly: true,
		path: "/",
		secure: !import.meta.env.DEV
	});
}

export function deletePasswordResetSessionTokenCookie(event: RequestEvent): void {
	event.cookies.set("password_reset_session", "", {
		maxAge: 0,
		sameSite: "lax",
		httpOnly: true,
		path: "/",
		secure: !import.meta.env.DEV
	});
}

export function sendPasswordResetEmail(email: string, code: string): void {
	console.log(`To ${email}: Your reset code is ${code}`);
}

export interface PasswordResetSession {
	id: string;
	userId: number;
	email: string;
	expiresAt: Date;
	code: string;
	emailVerified: boolean;
	twoFactorVerified: boolean;
}

export type PasswordResetSessionValidationResult =
	| { session: PasswordResetSession; user: User }
	| { session: null; user: null };
