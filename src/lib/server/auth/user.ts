import { db } from "$lib/server/db/";
import * as table from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { decryptToString, encryptString } from "$lib/server/auth/encryption";
import { hashPassword } from "$lib/server/auth/password";
import { generateRandomRecoveryCode } from "$lib/server/utils";

export function verifyUsernameInput(username: string): boolean {
	return username.length > 3 && username.length < 32 && username.trim() === username;
}

export async function createUser(email: string, username: string, password: string): Promise<User> {
	const passwordHash = await hashPassword(password);
	const recoveryCode = generateRandomRecoveryCode();
	const encryptedRecoveryCode = encryptString(recoveryCode);

	const [row] = await db
		.insert(table.user)
		.values({
			email: email,
			username: username,
			password_hash: passwordHash,
			recovery_code: encryptedRecoveryCode
		})
		.returning({
			id: table.user.id,
		})
	if (!row) {
		throw new Error("Unexpected error");
	}
	const user: User = {
		id: row.id,
		username,
		email,
		emailVerified: false,
		registeredTOTP: false,
		registeredPasskey: false,
		registeredSecurityKey: false,
		registered2FA: false
	};
	return user;
}

export async function updateUserPassword(userId: number, password: string): Promise<void> {
	const passwordHash = await hashPassword(password);
	await db
		.update(table.user)
		.set({
			password_hash: passwordHash
		})
		.where(eq(table.user.id, userId));
}

export async function updateUserEmailAndSetEmailAsVerified(userId: number, email: string): Promise<void> {
	await db
		.update(table.user)
		.set({
			email: email,
			email_verified: 1
		})
		.where(eq(table.user.id, userId));
}

export async function setUserAsEmailVerifiedIfEmailMatches(userId: number, email: string): Promise<boolean> {
	const result = await db
		.update(table.user)
		.set({
			email_verified: 1
		})
		.where(
			and(
				eq(table.user.id, userId),
				eq(table.user.email, email)
			)
		)
	return result.rowCount ? result.rowCount > 0 : false;
}

export async function getUserPasswordHash(userId: number): Promise<string> {
	const [row] = await db
		.select({
			password_hash: table.user.password_hash
		})
		.from(table.user)
		.where(eq(table.user.id, userId))
		.limit(1);
	if (!row) {
		throw new Error("Invalid user ID");
	}
	return row.password_hash;
}

export async function getUserRecoverCode(userId: number): Promise<string> {
	const [row] = await db
		.select({
			recovery_code: table.user.recovery_code
		})
		.from(table.user)
		.where(eq(table.user.id, userId))
		.limit(1);
	if (!row) {
		throw new Error("Invalid user ID");
	}
	return decryptToString(row.recovery_code);
}

export async function resetUserRecoveryCode(userId: number): Promise<string> {
	const recoveryCode = generateRandomRecoveryCode();
	const encrypted = encryptString(recoveryCode);
	await db
		.update(table.user)
		.set({
			recovery_code: encrypted
		})
		.where(eq(table.user.id, userId));
	return recoveryCode;
}

export async function getUserFromEmail(email: string): Promise<User | null> {
	const [row] = await db
		.select({
			user: {
				id: table.user.id,
				email: table.user.email,
				username: table.user.username,
				email_verified: table.user.email_verified,
			},
			totp_credential: {
				id: table.totpCredential.id ,
			},
			passkey_credential: {
				id: table.passkeyCredential.id,
			},
			security_key_credential: {
				id: table.securityKeyCredential.id,
			}
		})
		.from(table.user)
		.leftJoin(table.totpCredential, eq(table.user.id, table.totpCredential.user_id))
		.leftJoin(table.passkeyCredential, eq(table.user.id, table.passkeyCredential.user_id))
		.leftJoin(table.securityKeyCredential, eq(table.user.id, table.securityKeyCredential.user_id))
		.where(eq(table.user.email, email))
		.limit(1);
	if (!row) {
		return null;
	}
	const user: User = {
		id: row.user.id,
		email: row.user.email,
		username: row.user.username,
		emailVerified: Boolean(row.user.email_verified),
		registeredTOTP: row.totp_credential ? true : false,
		registeredPasskey: row.passkey_credential ? true : false,
		registeredSecurityKey: row.security_key_credential ? true : false,
		registered2FA: false
	};
	if (user.registeredPasskey || user.registeredSecurityKey || user.registeredTOTP) {
		user.registered2FA = true;
	}
	return user;
}

export interface User {
	id: number;
	email: string;
	username: string;
	emailVerified: boolean;
	registeredTOTP: boolean;
	registeredSecurityKey: boolean;
	registeredPasskey: boolean;
	registered2FA: boolean;
}
