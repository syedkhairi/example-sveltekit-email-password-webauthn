import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad, Actions } from './$types';
import { connectionsFormSchema } from './connections-form.svelte';
import { fail } from '@sveltejs/kit';

export const load = (async () => {
    return {
        connectionsForm: await superValidate(zod(connectionsFormSchema))
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
    default: async (event) => {
        const form = await superValidate(event.request, zod(connectionsFormSchema));
    
        if (!form.valid) return fail(400, { form });

        const { data } = form;
        const accounts = data.accounts;

        for (const account of accounts) {
            const { handle, app_password } = account;
            const validationResult = await validateBlueskyAccount(handle, app_password);
            if (!validationResult.valid) {
                return fail(400, {
                    form,
                    message: validationResult.error || 'Invalid account credentials',
                    handle
                });
            }
            // Save the account details to the database

            // Save app password as a hash
        }

        return { form }
    }
};

// Define interfaces for better type safety
interface BlueskyValidationResult {
    valid: boolean;
    error?: string;
}

interface BlueskyErrorResponse {
    message?: string;
    [key: string]: any;
}

async function validateBlueskyAccount(handle: string, appPassword: string): Promise<BlueskyValidationResult> {
    try {
        const response = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                identifier: handle,
                password: appPassword
            })
        });
        
        if (response.ok) {
            // Authentication successful, account is valid
            return { valid: true };
        } else {
            const error = await response.json() as BlueskyErrorResponse;
            return { 
                valid: false, 
                error: error.message || 'Invalid credentials' 
            };
        }
    } catch (error) {
        return { 
            valid: false, 
            error: 'Connection error' 
        };
    }
}