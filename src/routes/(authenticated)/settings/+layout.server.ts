import type { RequestEvent } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { get2FARedirect } from "$lib/server/auth/2fa";
import { getUserPasswordHash, getUserRecoverCode, resetUserRecoveryCode, updateUserPassword } from "$lib/server/auth/user";
import {
	deleteUserPasskeyCredential,
	deleteUserSecurityKeyCredential,
	getUserPasskeyCredentials,
	getUserSecurityKeyCredentials
} from "$lib/server/auth/webauthn";

export const load = (async (event: RequestEvent) => {
    if (event.locals.session === null || event.locals.user === null) {
        return redirect(302, "/login");
    }
    // if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
    //     return redirect(302, get2FARedirect(event.locals.user));
    // }
    let recoveryCode: string | null = null;
    if (event.locals.user.registered2FA) {
        recoveryCode = await getUserRecoverCode(event.locals.user.id);
    }
    const passkeyCredentials = await getUserPasskeyCredentials(event.locals.user.id);
    const securityKeyCredentials = await getUserSecurityKeyCredentials(event.locals.user.id);
    return {
        recoveryCode,
        user: event.locals.user,
        passkeyCredentials,
        securityKeyCredentials
    };
}) satisfies LayoutServerLoad;