<script lang="ts" module>
	import { z } from "zod";

	export const formSchema = z.object({
		encodedAttestationObject: z.string().nullable(),
		encodedClientDataJSON: z.string().nullable(),
		credentialName: z.string()
	});

	export type FormSchema = typeof formSchema;
</script>

<script lang="ts">
	import { encodeBase64 } from "@oslojs/encoding";
	import { createChallenge } from "$lib/client/webauthn";
	import { Button } from "$lib/components/ui/button/index.js";
	import SuperDebug, { type Infer, type SuperValidated, superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { toast } from "svelte-sonner";
	import { cn } from "$lib/utils";
	import Loader from "@lucide/svelte/icons/loader";

	import type { PageData } from "./$types";
	import { browser, dev } from "$app/environment";

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	
	const form = superForm(data.form, {
		validators: zodClient(formSchema),
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
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">Register a new security key</h3>
		<p class="text-muted-foreground text-sm">
			This will require you to use a physical security key such as a Yubikey or a FIDO2 key. This is a cross-platform
			authentication method that works on all major browsers and operating systems.
		</p>
	</div>

	<Button
		class="w-full"
		onclick={async () => {
			const challenge = await createChallenge();
	
			const credential = await navigator.credentials.create({
				publicKey: {
					challenge,
					user: {
						displayName: data.user.username,
						id: data.credentialUserId,
						name: data.user.email
					},
					rp: {
						name: "SvelteKit WebAuthn example"
					},
					pubKeyCredParams: [
						{
							alg: -7,
							type: "public-key"
						},
						{
							alg: -257,
							type: "public-key"
						}
					],
					attestation: "none",
					authenticatorSelection: {
						userVerification: "discouraged",
						residentKey: "discouraged",
						requireResidentKey: false,
						authenticatorAttachment: "cross-platform"
					},
					excludeCredentials: data.credentials.map((credential) => {
						return {
							id: credential.id,
							type: "public-key"
						};
					})
				}
			});
	
			if (!(credential instanceof PublicKeyCredential)) {
				throw new Error("Failed to create public key");
			}
			if (!(credential.response instanceof AuthenticatorAttestationResponse)) {
				throw new Error("Unexpected error");
			}
	
			$formData.encodedAttestationObject = encodeBase64(new Uint8Array(credential.response.attestationObject));
			$formData.encodedClientDataJSON = encodeBase64(new Uint8Array(credential.response.clientDataJSON));
		}}
	>
		Add a new security key
	</Button>

	{#if $formData.encodedAttestationObject && $formData.encodedClientDataJSON}
		<form method="post" class="space-y-3" use:enhance>
			<Form.Field name="credentialName" {form}>
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Security key name</Form.Label>
						<Form.Description>
							This is usually the name of the device you are using to register the security key.
						</Form.Description>
						<Input {...props} bind:value={$formData.credentialName} placeholder="Yubikey" required />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<input type="hidden" name="encodedAttestationObject" value={$formData.encodedAttestationObject} />
			<input type="hidden" name="encodedClientDataJSON" value={$formData.encodedClientDataJSON} />
			<Form.Button
				disabled={($formData.encodedAttestationObject === null && $formData.encodedClientDataJSON === null) || $submitting}
			>
				Save
				<Loader class={cn("ml-0.5 size-3 animate-spin" , {
					"hidden": !$submitting,
				})}/>
			</Form.Button>
		</form>
	{/if}

	{#if browser}
		<SuperDebug data={$formData} display={dev} />
	{/if}
</div>
