import { db } from '$lib/server/db/index';
import * as table from '$lib/server/db/schema';
import { sql, eq, and } from 'drizzle-orm';
import { generateRandomRecoveryCode } from "$lib/server/utils";
import { ExpiringTokenBucket } from "$lib/server/rate-limit";
import { decryptToString, encryptString } from "$lib/server/auth/encryption";
import { decodeBase64, encodeBase64 } from '@oslojs/encoding';

import type { User } from "$lib/server/auth/user";

export const recoveryCodeBucket = new ExpiringTokenBucket<number>(3, 60 * 60);

export async function resetUser2FAWithRecoveryCode(userId: number, recoveryCode: string): Promise<boolean> {
	// Retrieve user's recovery code
	const [user] = await db.select({ recoveryCode: table.user.recovery_code })
		.from(table.user)
		.where(eq(table.user.id, userId))
		.limit(1);
	
	if (!user) {
		return false;
	}
	
	const encryptedRecoveryCode = user.recoveryCode;
	const userRecoveryCode = decryptToString(encryptedRecoveryCode);
	if (recoveryCode !== userRecoveryCode) {
		return false;
	}

	const newRecoveryCode = generateRandomRecoveryCode();
	const encryptedNewRecoveryCode = encryptString(newRecoveryCode);

	// Use a transaction for all database operations
	try {
		// Start transaction
		const result = await db.transaction(async (tx) => {
			// Update user's recovery code
			const updateResult = await tx.update(table.user)
				.set({
					recovery_code: encryptedNewRecoveryCode,
				})
				.where(
					and(
						eq(table.user.id, userId),
						eq(table.user.recovery_code, encryptedRecoveryCode)
					)
				);
			
			// In pg driver, affectedRows property indicates number of rows affected
			if (updateResult.rowCount === 0) {
				return false;
			}
			
			// Reset two-factor verification for all sessions
			await tx.update(table.session)
				.set({ two_factor_verified: 0 })
				.where(eq(table.session.user_id, userId));
			
			// Delete all associated credentials
			await tx.delete(table.totpCredential)
				.where(eq(table.totpCredential.user_id, userId));
				
			await tx.delete(table.passkeyCredential)
				.where(eq(table.passkeyCredential.user_id, userId));
				
			await tx.delete(table.securityKeyCredential)
				.where(eq(table.securityKeyCredential.user_id, userId));
				
			return true;
		});
		
		return result;
	} catch (e) {
		console.error("Error in reset 2FA transaction:", e);
		throw e;
	}
}

export function get2FARedirect(user: User): string {
	if (user.registeredPasskey) {
		return "/settings/authentication/passkey";
	}
	if (user.registeredSecurityKey) {
		return "/settings/authentication/security-key";
	}
	if (user.registeredTOTP) {
		return "/settings/authentication/totp";
	}
	return "/settings/authentication/setup";
}

export function getPasswordReset2FARedirect(user: User): string {
	if (user.registeredPasskey) {
		return "/reset-password/2fa/passkey";
	}
	if (user.registeredSecurityKey) {
		return "/reset-password/2fa/security-key";
	}
	if (user.registeredTOTP) {
		return "/reset-password/2fa/totp";
	}
	return "/settings/authentication/setup";
}
