import { generateRandomOTP } from "$lib/server/utils";
import { db } from "$lib/server/db/";
import * as table from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { ExpiringTokenBucket } from "$lib/server/rate-limit";
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";

import type { RequestEvent } from "@sveltejs/kit";

export async function getUserEmailVerificationRequest(userId: number, id: string): Promise<EmailVerificationRequest | null> {
	const [ row ] = await db
		.select({
			id: table.emailVerificationRequest.id,
			userId: table.emailVerificationRequest.user_id,
			code: table.emailVerificationRequest.code,
			email: table.emailVerificationRequest.email,
			expiresAt: table.emailVerificationRequest.expires_at
		})
		.from(table.emailVerificationRequest)
		.where(
			and(
				eq(table.emailVerificationRequest.id, id),
				eq(table.emailVerificationRequest.user_id, userId),
			)
		)
	if (row === null) {
		return row;
	}
	const request: EmailVerificationRequest = {
		id: row.id,
		userId: row.userId,
		code: row.code,
		email: row.email,
		expiresAt: new Date(row.expiresAt * 1000)
	};
	return request;
}

export async function createEmailVerificationRequest(userId: number, email: string): Promise<EmailVerificationRequest> {
	deleteUserEmailVerificationRequest(userId);
	const idBytes = new Uint8Array(20);
	crypto.getRandomValues(idBytes);
	const id = encodeBase32LowerCaseNoPadding(idBytes);

	const code = generateRandomOTP();
	const expiresAt = new Date(Date.now() + 1000 * 60 * 10);

	await db
		.insert(table.emailVerificationRequest)
		.values({
			id,
			user_id: userId,
			code,
			email,
			expires_at: Math.floor(expiresAt.getTime() / 1000)
		})
		.returning({
			id: table.emailVerificationRequest.id
		})

	const request: EmailVerificationRequest = {
		id,
		userId,
		code,
		email,
		expiresAt
	};
	return request;
}

export async function deleteUserEmailVerificationRequest(userId: number): Promise<void> {
	await db
		.delete(table.emailVerificationRequest)
		.where(
			eq(table.emailVerificationRequest.user_id, userId)
		)
}

export function sendVerificationEmail(email: string, code: string): void {
	console.log(`To ${email}: Your verification code is ${code}`);
}

export function setEmailVerificationRequestCookie(event: RequestEvent, request: EmailVerificationRequest): void {
	event.cookies.set("email_verification", request.id, {
		httpOnly: true,
		path: "/",
		secure: import.meta.env.PROD,
		sameSite: "lax",
		expires: request.expiresAt
	});
}

export function deleteEmailVerificationRequestCookie(event: RequestEvent): void {
	event.cookies.set("email_verification", "", {
		httpOnly: true,
		path: "/",
		secure: import.meta.env.PROD,
		sameSite: "lax",
		maxAge: 0
	});
}

export async function getUserEmailVerificationRequestFromRequest(event: RequestEvent): Promise<EmailVerificationRequest | null> {
	if (event.locals.user === null) {
		return null;
	}
	const id = event.cookies.get("email_verification") ?? null;
	if (id === null) {
		return null;
	}
	const request = await getUserEmailVerificationRequest(event.locals.user.id, id);
	if (request === null) {
		deleteEmailVerificationRequestCookie(event);
	}
	return request;
}

export const sendVerificationEmailBucket = new ExpiringTokenBucket<number>(3, 60 * 10);

export interface EmailVerificationRequest {
	id: string;
	userId: number;
	code: string;
	email: string;
	expiresAt: Date;
}
