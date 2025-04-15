import { encodeHexLowerCase } from "@oslojs/encoding";
import { db } from "$lib/server/db/";
import * as table from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';

const challengeBucket = new Set<string>();

export function createWebAuthnChallenge(): Uint8Array {
	const challenge = new Uint8Array(20);
	crypto.getRandomValues(challenge);
	const encoded = encodeHexLowerCase(challenge);
	challengeBucket.add(encoded);
	return challenge;
}

export function verifyWebAuthnChallenge(challenge: Uint8Array): boolean {
	const encoded = encodeHexLowerCase(challenge);
	return challengeBucket.delete(encoded);
}

export async function getUserPasskeyCredentials(userId: number): Promise<WebAuthnUserCredential[]> {
	const rows = await db
		.select({
			id: table.passkeyCredential.id,
			user_id: table.passkeyCredential.user_id,
			name: table.passkeyCredential.name,
			algorithm: table.passkeyCredential.algorithm,
			public_key: table.passkeyCredential.public_key
		})
		.from(table.passkeyCredential)
		.where(eq(table.passkeyCredential.user_id, userId));

	const credentials: WebAuthnUserCredential[] = [];
	for (const row of rows) {
		const credential: WebAuthnUserCredential = {
			id: row.id,
			userId: row.user_id,
			name: row.name,
			algorithmId: row.algorithm,
			publicKey: row.public_key
		};
		credentials.push(credential);
	}
	return credentials;
}

export async function getPasskeyCredential(credentialId: Uint8Array): Promise<WebAuthnUserCredential | null> {
	const [row] = await db
		.select({
			id: table.passkeyCredential.id,
			user_id: table.passkeyCredential.user_id,
			name: table.passkeyCredential.name,
			algorithm: table.passkeyCredential.algorithm,
			public_key: table.passkeyCredential.public_key
		})
		.from(table.passkeyCredential)
		.where(eq(table.passkeyCredential.id, credentialId))
		.limit(1);
	if (row === null) {
		return null;
	}
	const credential: WebAuthnUserCredential = {
		id: row.id,
		userId: row.user_id,
		name: row.name,
		algorithmId: row.algorithm,
		publicKey: row.public_key
	};
	return credential;
}

export async function getUserPasskeyCredential(userId: number, credentialId: Uint8Array): Promise<WebAuthnUserCredential | null> {
	const [row] = await db
		.select({
			id: table.passkeyCredential.id,
			user_id: table.passkeyCredential.user_id,
			name: table.passkeyCredential.name,
			algorithm: table.passkeyCredential.algorithm,
			public_key: table.passkeyCredential.public_key
		})
		.from(table.passkeyCredential)
		.where(
			and(
				eq(table.passkeyCredential.id, credentialId),
				eq(table.passkeyCredential.user_id, userId)
			)
		)
		.limit(1);
	if (row === null) {
		return null;
	}
	const credential: WebAuthnUserCredential = {
		id: row.id,
		userId: row.user_id,
		name: row.name,
		algorithmId: row.algorithm,
		publicKey: row.public_key
	};
	return credential;
}

export async function createPasskeyCredential(credential: WebAuthnUserCredential): Promise<void> {
	await db
		.insert(table.passkeyCredential)
		.values({
			id: credential.id,
			user_id: credential.userId,
			name: credential.name,
			algorithm: credential.algorithmId,
			public_key: credential.publicKey
		});
}

export async function deleteUserPasskeyCredential(userId: number, credentialId: Uint8Array): Promise<boolean> {
	const result = await db
		.delete(table.passkeyCredential)
		.where(
			and(
				eq(table.passkeyCredential.id, credentialId),
				eq(table.passkeyCredential.user_id, userId)
			)
		);
	return result.rowCount ? result.rowCount > 0 : false;
}

export async function getUserSecurityKeyCredentials(userId: number): Promise<WebAuthnUserCredential[]> {
	const rows = await db
		.select({
			id: table.securityKeyCredential.id,
			user_id: table.securityKeyCredential.user_id,
			name: table.securityKeyCredential.name,
			algorithm: table.securityKeyCredential.algorithm,
			public_key: table.securityKeyCredential.public_key
		})
		.from(table.securityKeyCredential)
		.where(eq(table.securityKeyCredential.user_id, userId));
	const credentials: WebAuthnUserCredential[] = [];
	for (const row of rows) {
		const credential: WebAuthnUserCredential = {
			id: row.id,
			userId: row.user_id,
			name: row.name,
			algorithmId: row.algorithm,
			publicKey: row.public_key
		};
		credentials.push(credential);
	}
	return credentials;
}

export async function getUserSecurityKeyCredential(userId: number, credentialId: Uint8Array): Promise<WebAuthnUserCredential | null> {
	const [row] = await db
		.select({
			id: table.securityKeyCredential.id,
			user_id: table.securityKeyCredential.user_id,
			name: table.securityKeyCredential.name,
			algorithm: table.securityKeyCredential.algorithm,
			public_key: table.securityKeyCredential.public_key
		})
		.from(table.securityKeyCredential)
		.where(
			and(
				eq(table.securityKeyCredential.id, credentialId),
				eq(table.securityKeyCredential.user_id, userId)
			)
		)
		.limit(1);
	if (row === null) {
		return null;
	}
	const credential: WebAuthnUserCredential = {
		id: row.id,
		userId: row.user_id,
		name: row.name,
		algorithmId: row.algorithm,
		publicKey: row.public_key
	};
	return credential;
}

export async function createSecurityKeyCredential(credential: WebAuthnUserCredential): Promise<void> {
	await db
		.insert(table.securityKeyCredential)
		.values({
			id: credential.id,
			user_id: credential.userId,
			name: credential.name,
			algorithm: credential.algorithmId,
			public_key: credential.publicKey
		});
}

export async function deleteUserSecurityKeyCredential(userId: number, credentialId: Uint8Array): Promise<boolean> {
	const result = await db
		.delete(table.securityKeyCredential)
		.where(
			and(
				eq(table.securityKeyCredential.id, credentialId),
				eq(table.securityKeyCredential.user_id, userId)
			)
		);
	return result.rowCount ? result.rowCount > 0 : false;
}

export interface WebAuthnUserCredential {
	id: Uint8Array;
	userId: number;
	name: string;
	algorithmId: number;
	publicKey: Uint8Array;
}
