<script lang="ts" module>
	import { z } from "zod";

	export const loginFormSchema = z.object({
		email: z.string().email(),
		password: z.string().min(8, "Password must be at least 8 characters long"),
	});

	export type LoginFormSchema = typeof loginFormSchema;
</script>

<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { createChallenge } from "$lib/client/webauthn";
	import { encodeBase64 } from "@oslojs/encoding";
	import { goto } from "$app/navigation";
	import { zodClient } from "sveltekit-superforms/adapters";
	import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
	import { toast } from "svelte-sonner";

	let { data }: { data: SuperValidated<Infer<LoginFormSchema>> } = $props();

	const form = superForm(data, {
		validators: zodClient(loginFormSchema),
		resetForm: true,
		onResult: ({ result }) => {
			if (result.type === "failure") {
				toast.error(result.data?.message ?? "An error occurred");
			}

			if (result.type === "success") {
				toast.success(result.data?.message ?? "Success");
			}
		},
	});

	const { form: formData, enhance, submitting } = form;

	let passkeyErrorMessage = $state<string | null>("")
</script>

<Card.Root class="mx-auto max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Sign in</Card.Title>
		<Card.Description>Enter your details below to login to your account</Card.Description>
	</Card.Header>
	<Card.Content>
		<form method="POST" class="grid gap-3" use:enhance>
            <Form.Field name="email" {form}>
                <Form.Control>
                    {#snippet children({ props })}
                        <Form.Label>Email address</Form.Label>
                        <Input 
							{...props} 
							type="email" 
							required 
							placeholder="syed@feedr.com" 
							bind:value={$formData.email} 
							autocomplete="email" 
							disabled={$submitting} />
                    {/snippet}
                </Form.Control>
                <Form.FieldErrors />
            </Form.Field>

			<Form.Field name="password" {form}>
                <Form.Control>
                    {#snippet children({ props })}
						<div class="flex items-center">
							<Form.Label>Password</Form.Label>
							<a href="/forgot-password" class="ml-auto inline-block text-sm underline">
								Forgot your password?
							</a>
						</div>
                        <Input 
							{...props} 
							type="password" 
							required 
							bind:value={$formData.password} 
							autocomplete="current-password" 
							disabled={$submitting} />
                    {/snippet}
                </Form.Control>
                <Form.FieldErrors />
            </Form.Field>

			<div class="space-y-4">
				<Form.Button 
					class="w-full" 
					disabled={($formData.email === "" || $formData.password === "") || $submitting}
					>
					Sign in
				</Form.Button>

				<Button 
					variant="outline" 
					class="w-full"
					onclick={async () => {
						const challenge = await createChallenge();
			
						const credential = await navigator.credentials.get({
							publicKey: {
								challenge,
								userVerification: "required"
							}
						});
			
						if (!(credential instanceof PublicKeyCredential)) {
							throw new Error("Failed to create public key");
						}
						if (!(credential.response instanceof AuthenticatorAssertionResponse)) {
							throw new Error("Unexpected error");
						}
			
						const response = await fetch("/login/passkey", {
							method: "POST",
							// this example uses JSON but you can use something like CBOR to get something more compact
							body: JSON.stringify({
								credential_id: encodeBase64(new Uint8Array(credential.rawId)),
								signature: encodeBase64(new Uint8Array(credential.response.signature)),
								authenticator_data: encodeBase64(new Uint8Array(credential.response.authenticatorData)),
								client_data_json: encodeBase64(new Uint8Array(credential.response.clientDataJSON))
							})
						});
			
						if (response.ok) {
							goto("/");
						} else {
							passkeyErrorMessage = await response.text();
						}
					}}
				>
					Sign in with a passkey
				</Button>
			</div>
        </form>

		<div class="mt-4 text-center text-sm">
			Don't have an account?
			<a href="/signup" class="underline"> Register </a>
		</div>
	</Card.Content>
</Card.Root>
