<script lang="ts">
	import { goto } from "$app/navigation";
	import { encodeBase64 } from "@oslojs/encoding";
	import { createChallenge } from "$lib/client/webauthn";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";

	import type { PageData } from "./$types";

	let { data } : { data: PageData } = $props();

	let message = $state("");
</script>

<Card.Root class="mx-auto max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Authenticate with security keys</Card.Title>
		<Card.Description>As a two-factor security measure, please authenticate with your security keys you have used previously.</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="grid gap-4">
			<Button 
				type="submit" 
				class="w-full"
				onclick={async () => {
					const challenge = await createChallenge();
		
					const credential = await navigator.credentials.get({
						publicKey: {
							challenge,
							userVerification: "discouraged",
							allowCredentials: data.credentials.map((credential) => {
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
					if (!(credential.response instanceof AuthenticatorAssertionResponse)) {
						throw new Error("Unexpected error");
					}
		
					const response = await fetch("/reset-password/settings/authentication/security-key", {
						method: "POST",
						body: JSON.stringify({
							credential_id: encodeBase64(new Uint8Array(credential.rawId)),
							signature: encodeBase64(new Uint8Array(credential.response.signature)),
							authenticator_data: encodeBase64(new Uint8Array(credential.response.authenticatorData)),
							client_data_json: encodeBase64(new Uint8Array(credential.response.clientDataJSON))
						})
					});
		
					if (response.ok) {
						goto("/reset-password");
					} else {
						message = await response.text();
					}
				}}
			>
				Authenticate with security key
			</Button>

			<div class="relative">
				<div class="absolute inset-0 flex items-center">
					<span class="w-full border-t"></span>
				</div>
				<div class="relative flex justify-center text-xs uppercase">
					<span class="bg-background text-muted-foreground px-2"> Or </span>
				</div>
			</div>

			<div class="grid gap-2">
				<Button 
					variant="outline"
					class="w-full"
					href="/reset-password/2fa/recovery-code"
				>
					Use a recovery code
				</Button>

				{#if data.user.registeredPasskey}
					<Button 
						variant="outline"
						class="w-full"
						href="/reset-password/2fa/passkey"
					>
						Use a passkey
					</Button>
				{/if}

				{#if data.user.registeredTOTP}
					<Button 
						variant="outline"
						class="w-full"
						href="/reset-password/2fa/totp"
					>
						Use an authenticator app
					</Button>
				{/if}
			</div>
		</div>
	</Card.Content>
</Card.Root>