import { redirect } from "@sveltejs/kit";
import { validatePasswordResetSessionRequest } from "$lib/server/auth/password-reset";

export async function handleAuthAction(authAction: AuthAction) {
    switch (authAction) {
        case "reset-password":
            return {};
        case "login":
            return {
                redirect: "/login"
            };
        default:
            return {
                redirect: "/"
            };
    }   
}

type AuthAction = "reset-password" | "login"