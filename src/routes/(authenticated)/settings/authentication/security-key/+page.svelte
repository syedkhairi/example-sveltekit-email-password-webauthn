<script lang="ts">
	import { goto } from "$app/navigation";
	import { encodeBase64 } from "@oslojs/encoding";
	import { createChallenge } from "$lib/client/webauthn";

	import type { PageData } from "./$types";

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let message = $state("");
</script>

<h1>Authenticate with security keys</h1>
<div>
	<button
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

			const response = await fetch("/settings/authentication/security-key", {
				method: "POST",
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
				message = await response.text();
			}
		}}>Authenticate</button
	>
	<p>{message}</p>
</div>
<a href="/settings/authentication/reset">Use recovery code</a>

{#if data.user.registeredTOTP}
	<a href="/settings/authentication/totp">Use authenticator apps</a>
{/if}
{#if data.user.registeredPasskey}
	<a href="/settings/authentication/passkey">Use passkeys</a>
{/if}
