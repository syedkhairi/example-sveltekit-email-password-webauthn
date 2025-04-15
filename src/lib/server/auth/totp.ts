import { db } from "$lib/server/db/";
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { decrypt, encrypt } from "./encryption";
import { ExpiringTokenBucket, RefillingTokenBucket } from "$lib/server/rate-limit";

export const totpBucket = new ExpiringTokenBucket<number>(5, 60 * 30);
export const totpUpdateBucket = new RefillingTokenBucket<number>(3, 60 * 10);

export async function getUserTOTPKey(userId: number): Promise<Uint8Array | null> {
	const [row] = await db
		.select({ 
			totp_credential: {
				key: table.totpCredential.key,
			}
		 })
		.from(table.totpCredential)
		.where(eq(table.totpCredential.user_id, userId))
		.limit(1);
	
	if (!row) {
		return null;
	}

	const encrypted = row.totp_credential.key;
	if (encrypted === null) {
		return null;
	}
	
	return decrypt(encrypted);
}

export async function updateUserTOTPKey(userId: number, key: Uint8Array): Promise<void> {
	const encrypted = encrypt(key);
	
	// Using a transaction with Drizzle
	await db.transaction(async (tx) => {
		// Delete any existing TOTP credential for this user
		await tx
			.delete(table.totpCredential)
			.where(eq(table.totpCredential.user_id, userId));
		
		// Insert the new TOTP credential
		await tx
			.insert(table.totpCredential)
			.values({
				user_id: userId,
				key: encrypted
			});
	});
}

export async function deleteUserTOTPKey(userId: number): Promise<void> {
	await db
		.delete(table.totpCredential)
		.where(eq(table.totpCredential.user_id, userId));
}
