import { db } from "$lib/server/db/";
import * as table from '$lib/server/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

import type { User } from "$lib/server/auth/user";
import type { RequestEvent } from "@sveltejs/kit";

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const [row] = await db
		.select({
			session: {
				id: table.session.id,
				userId: table.session.user_id,
				expiresAt: table.session.expires_at,
				twoFactorVerified: table.session.two_factor_verified
			},
			user: {
				id: table.user.id,
				email: table.user.email,
				username: table.user.username,
				emailVerified: table.user.email_verified,
				registeredTOTP: sql<number>`CASE WHEN ${table.totpCredential.id} IS NOT NULL THEN 1 ELSE 0 END`,
				registeredPasskey: sql<number>`CASE WHEN ${table.passkeyCredential.id} IS NOT NULL THEN 1 ELSE 0 END`,
				registeredSecurityKey: sql<number>`CASE WHEN ${table.securityKeyCredential.id} IS NOT NULL THEN 1 ELSE 0 END`
			}
		})
		.from(table.session)
		.innerJoin(table.user, eq(table.session.user_id, table.user.id))
		.leftJoin(table.totpCredential, eq(table.session.user_id, table.totpCredential.user_id))
		.leftJoin(table.passkeyCredential, eq(table.user.id, table.passkeyCredential.user_id))
		.leftJoin(table.securityKeyCredential, eq(table.user.id, table.securityKeyCredential.user_id))
		.where(eq(table.session.id, sessionId))
		.limit(1);
	if (!row) {
		return { session: null, user: null };
	}
	const session: Session = {
		id: row.session.id,
		userId: row.session.userId,
		expiresAt: new Date(row.session.expiresAt * 1000),
		twoFactorVerified: Boolean(row.session.twoFactorVerified)
	};
	const user: User = {
		id: row.user.id,
		email: row.user.email,
		username: row.user.username,
		emailVerified: Boolean(row.user.emailVerified),
		registeredTOTP: Boolean(row.user.registeredTOTP),
		registeredPasskey: Boolean(row.user.registeredPasskey),
		registeredSecurityKey: Boolean(row.user.registeredSecurityKey),
		registered2FA: false
	};
	if (user.registeredPasskey || user.registeredSecurityKey || user.registeredTOTP) {
		user.registered2FA = true;
	}
	if (Date.now() >= session.expiresAt.getTime()) {
		await db
			.delete(table.session)
			.where(
				and(
					eq(table.session.id, sessionId),
					eq(table.session.user_id, user.id)
				)
			);
		return { session: null, user: null };
	}
	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		await db
			.update(table.session)
			.set({
				expires_at: Math.floor(session.expiresAt.getTime() / 1000)
			})
			.where(eq(table.session.id, sessionId));
	}
	return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db
		.delete(table.session)
		.where(eq(table.session.id, sessionId));
}

export async function invalidateUserSessions(userId: number): Promise<void> {
	await db
		.delete(table.session)
		.where(eq(table.session.user_id, userId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date): void {
	event.cookies.set("session", token, {
		httpOnly: true,
		path: "/",
		secure: import.meta.env.PROD,
		sameSite: "lax",
		expires: expiresAt
	});
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
	event.cookies.set("session", "", {
		httpOnly: true,
		path: "/",
		secure: import.meta.env.PROD,
		sameSite: "lax",
		maxAge: 0
	});
}

export function generateSessionToken(): string {
	const tokenBytes = new Uint8Array(20);
	crypto.getRandomValues(tokenBytes);
	const token = encodeBase32LowerCaseNoPadding(tokenBytes);
	return token;
}

export async function createSession(token: string, userId: number, flags: SessionFlags): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
		twoFactorVerified: flags.twoFactorVerified
	};
	await db
		.insert(table.session)
		.values({
			id: session.id,
			user_id: session.userId,
			expires_at: Math.floor(session.expiresAt.getTime() / 1000),
			two_factor_verified: Number(session.twoFactorVerified)
		});
	return session;
}

export async function setSessionAs2FAVerified(sessionId: string): Promise<void> {
	await db
		.update(table.session)
		.set({
			two_factor_verified: 1
		})
		.where(eq(table.session.id, sessionId));
}

export interface SessionFlags {
	twoFactorVerified: boolean;
}

export interface Session extends SessionFlags {
	id: string;
	expiresAt: Date;
	userId: number;
}

type SessionValidationResult = { session: Session; user: User } | { session: null; user: null };
