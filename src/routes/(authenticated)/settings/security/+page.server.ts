import type { PageServerLoad } from './$types';
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { type Actions, fail, redirect, type RequestEvent } from "@sveltejs/kit";
import { emailFormSchema } from "./email-form.svelte";
import { passwordFormSchema } from "./password-form.svelte";
import { totpFormSchema } from './totp-form.svelte';
import { passkeyFormSchema } from './passkey-form.svelte';
import { securityKeySchema, type SecurityKeySchema } from './security-key-form.svelte';
import {
    createEmailVerificationRequest,
    sendVerificationEmail,
    sendVerificationEmailBucket,
    setEmailVerificationRequestCookie
} from "$lib/server/email-verification";
import { checkEmailAvailability, verifyEmailInput } from "$lib/server/email";
import { verifyPasswordHash, verifyPasswordStrength } from "$lib/server/password";
import { getUserPasswordHash, getUserRecoverCode, resetUserRecoveryCode, updateUserPassword } from "$lib/server/user";
import {
    createSession,
    generateSessionToken,
    invalidateUserSessions,
    setSessionTokenCookie
} from "$lib/server/session";
import {
    deleteUserPasskeyCredential,
    deleteUserSecurityKeyCredential,
    getUserPasskeyCredentials,
    getUserSecurityKeyCredentials
} from "$lib/server/webauthn";
import { decodeBase64, encodeBase64 } from "@oslojs/encoding";
import { get2FARedirect } from "$lib/server/2fa";
import { deleteUserTOTPKey, totpUpdateBucket } from "$lib/server/totp";
import { ExpiringTokenBucket } from "$lib/server/rate-limit";

import type { SessionFlags } from "$lib/server/session";

const passwordUpdateBucket = new ExpiringTokenBucket<string>(5, 60 * 30);

export const load = (async ({ parent }) => {
    console.log("load");
    const parentDataFromLayout = await parent();

    if (parentDataFromLayout) {
        // You can access the user data from the parent layout
        const { user, securityKeyCredentials, passkeyCredentials } = parentDataFromLayout;
        if (!user) {
            throw redirect(302, "/settings");
        }

        return {
            emailForm: await superValidate({
                currentEmailAddress: user.email,
                newEmailAddress: "",
            }, zod(emailFormSchema), {
                errors: false
            }),
            passwordForm: await superValidate(zod(passwordFormSchema)),
            totpForm: await superValidate({
                registeredTotp: user.registeredTOTP,
            }, zod(totpFormSchema)),
            passkeyForm: await superValidate({
                registeredPasskey: user.registeredPasskey,
                passkeyCredentialId: passkeyCredentials[0]?.id ? encodeBase64(passkeyCredentials[0]?.id) : null,
            }, zod(passkeyFormSchema)),
            securityKeyForm: await superValidate({
                registeredSecurityKey: user.registeredSecurityKey,
                securityKeyCredentialIds: securityKeyCredentials.map((credential) => credential.id as Uint8Array<ArrayBuffer>)
            }, zod(securityKeySchema)),
        };
    }

    return {
        emailForm: await superValidate(zod(emailFormSchema)),
        passwordForm: await superValidate(zod(passwordFormSchema)),
        totpForm: await superValidate(zod(totpFormSchema)),
        passkeyForm: await superValidate(zod(passkeyFormSchema)),
        securityKeyForm: await superValidate(zod(securityKeySchema)),
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
	update_password: updatePasswordAction,
	update_email: updateEmailAction,
	update_totp: updateTotpAction,
	update_passkey: updatePasskeyAction,
	update_security_key: updateSecurityKeyAction,
	regenerate_recovery_code: regenerateRecoveryCodeAction
};

async function updatePasswordAction(event: RequestEvent) {
    const passwordForm = await superValidate(event.request, zod(passwordFormSchema));

    if (!passwordForm.valid) return fail(400, { passwordForm });

    if (event.locals.session === null || event.locals.user === null) {
        return fail(401, {
            passwordForm,
            message: "Not authenticated"
        });
    }
    if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
        return fail(403, {
            passwordForm,
            message: "Forbidden"
        });
    }
    if (!passwordUpdateBucket.check(event.locals.session.id, 1)) {
        return fail(429, {
            passwordForm,
            message: "Too many requests"
        });
    }

    const { data: formData } = passwordForm;
    const password = formData.currentPassword;
    const newPassword = formData.newPassword;
    const strongPassword = await verifyPasswordStrength(newPassword);
    if (!strongPassword) {
        return fail(400, {
            passwordForm,
            message: "Password is too weak"
        });
    }

    if (!passwordUpdateBucket.consume(event.locals.session.id, 1)) {
        return fail(429, {
            passwordForm,
            message: "Too many requests"
        });
    }
    const passwordHash = getUserPasswordHash(event.locals.user.id);
    const validPassword = await verifyPasswordHash(passwordHash, password);
    if (!validPassword) {
        return fail(400, {
            passwordForm,
            message: "Invalid password"
        });
    }
    passwordUpdateBucket.reset(event.locals.session.id);
    invalidateUserSessions(event.locals.user.id);
    await updateUserPassword(event.locals.user.id, newPassword);

    const sessionToken = generateSessionToken();
    const sessionFlags: SessionFlags = {
        twoFactorVerified: event.locals.session.twoFactorVerified
    };
    const session = createSession(sessionToken, event.locals.user.id, sessionFlags);
    setSessionTokenCookie(event, sessionToken, session.expiresAt);
    return message(
        passwordForm,
        "Password updated successfully"
    )
}

async function updateEmailAction(event: RequestEvent) {
    const emailForm = await superValidate(event.request, zod(emailFormSchema));

    if (!emailForm.valid) return fail(400, { emailForm });

    if (event.locals.session === null || event.locals.user === null) {
        return fail(401, { 
            emailForm,
            message: "Not authenticated" 
        });
    }
    if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
        return fail(403, {
            emailForm,
            message: "Forbidden"
        });
    }
    if (!sendVerificationEmailBucket.check(event.locals.user.id, 1)) {
        return fail(429, {
            emailForm,
            message: "Too many requests"
        });
    }

    const { data: formData } = emailForm;
    const email = formData.newEmailAddress;
    const emailAvailable = checkEmailAvailability(email);
    if (!emailAvailable) {
        return fail(400, {
            emailForm,
            message: "Email already in use"
        });
    }
    if (!sendVerificationEmailBucket.consume(event.locals.user.id, 1)) {
        return fail(429, {
            emailForm,
            message: "Too many requests"
        });
    }
    const verificationRequest = createEmailVerificationRequest(event.locals.user.id, email);
    sendVerificationEmail(verificationRequest.email, verificationRequest.code);
    setEmailVerificationRequestCookie(event, verificationRequest);
    return redirect(302, "/verify-email");
}

async function updateTotpAction(event: RequestEvent) {
    const totpForm = await superValidate(event.request, zod(totpFormSchema));

    if (!totpForm.valid) return fail(400, { totpForm });

    if (event.locals.session === null || event.locals.user === null) {
        console.log("Not authenticated");
        return fail(401, { 
            totpForm,
            message: "Not authenticated"
        });
    }
    if (!event.locals.user.emailVerified) {
        console.log("Email not verified");
        return fail(403, { 
            totpForm,
            message: "Email not verified"
        });
    }
    if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
        console.log("2FA not verified");
        return fail(403, { 
            totpForm,
            message: "2FA not verified"
        });
    }
    // if (!totpUpdateBucket.consume(event.locals.user.id, 1)) {
    //     console.log("Too many requests");
    //     return fail(429, { 
    //         totpForm,
    //         message: "Too many requests"
    //     });
    // }

    const { data: formData } = totpForm;
    const totpCode = formData.registeredTotp;

    if (totpCode === false) {
        deleteUserTOTPKey(event.locals.user.id);
        return message(
            totpForm,
            "TOTP disconnected successfully"
        )
    } else {
        return redirect(307, "/settings/authentication/totp/setup");
    }
}

async function updatePasskeyAction(event: RequestEvent) {
    console.log("updatePasskeyAction");
    const passkeyForm = await superValidate(event.request, zod(passkeyFormSchema));

    if (!passkeyForm.valid) return fail(400, { passkeyForm });

    if (event.locals.session === null || event.locals.user === null) {
        return fail(401, {
            passkeyForm,
            message: "Not authenticated"
        });
    }
    if (!event.locals.user.emailVerified) {
        return fail(403, {
            passkeyForm,
            message: "Email not verified"
        });
    }
    if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
        return fail(403, {
            passkeyForm,
            message: "2FA not verified"
        });
    }
    const { data: formData } = passkeyForm;
    const registeredPasskey = formData.registeredPasskey;
    const encodedCredentialId = formData.passkeyCredentialId;

    console.log("encodedCredentialId", encodedCredentialId);

    if (registeredPasskey === false) {
        // User wants to delete their passkey
        if (typeof encodedCredentialId !== "string") {
            return fail(400, {
                passkeyForm,
                message: "Invalid credential ID"
            });
        }
        let credentialId: Uint8Array;
        try {
            credentialId = decodeBase64(encodedCredentialId);
        } catch {
            return fail(400, {
                passkeyForm,
                message: "Invalid credential ID"
            });
        }
        const deleted = deleteUserPasskeyCredential(event.locals.user.id, credentialId);
        if (!deleted) {
            return fail(400, {
                passkeyForm,
                message: "Unable to delete passkey"
            });
        }

        return message(
            passkeyForm,
            "Passkey deleted successfully"
        )
    } else {
        // User wants to register a new passkey
        return redirect(307, "/settings/authentication/passkey/register");
    }
}

async function updateSecurityKeyAction(event: RequestEvent) {
    const securityKeyForm = await superValidate(event.request, zod(securityKeySchema));

    if (!securityKeyForm.valid) return fail(400, { securityKeyForm });

    if (event.locals.session === null || event.locals.user === null) {
        return fail(401, {
            securityKeyForm,
            message: "Not authenticated"
        });
    }
    if (!event.locals.user.emailVerified) {
        return fail(403, {
            securityKeyForm,
            message: "Email not verified"
        });
    }
    if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
        return fail(403, {
            securityKeyForm,
            message: "2FA not verified"
        });
    }

    const { data: formData } = securityKeyForm;
    const registeredSecurityKey = formData.registeredSecurityKey;
    const encodedCredentialId = formData.securityKeyCredentialIds[0];

    if (registeredSecurityKey === false) {
        if (typeof encodedCredentialId !== "string") {
            return fail(400, {
                securityKeyForm,
                message: "Invalid credential ID"
            });
        }
        let credentialId: Uint8Array;
        try {
            credentialId = decodeBase64(encodedCredentialId);
        } catch {
            return fail(400, {
                securityKeyForm,
                message: "Invalid credential ID"
            });
        }
        const deleted = deleteUserSecurityKeyCredential(event.locals.user.id, credentialId);
        if (!deleted) {
            return fail(400, {
                securityKeyForm,
                message: "Unable to delete security key"
            });
        }

        return message(
            securityKeyForm,
            "Security key deleted successfully"
        )
    } else {
        return redirect(307, "/settings/authentication/security-key/register");
    }
}

async function regenerateRecoveryCodeAction(event: RequestEvent) {
    if (event.locals.session === null || event.locals.user === null) {
        return fail(401);
    }
    if (!event.locals.user.emailVerified) {
        return fail(403);
    }
    if (!event.locals.session.twoFactorVerified) {
        return fail(403);
    }
    resetUserRecoveryCode(event.locals.session.userId);
    return {};
}
