<script lang="ts">
	import { enhance } from "$app/forms";

	import type { ActionData, PageData } from "./$types";

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
</script>

<h1>Authenticate with authenticator app</h1>
<p>Enter the code from your app.</p>
<form method="post" use:enhance>
	<label for="form-totp.code">Code</label>
	<input id="form-totp.code" name="code" autocomplete="one-time-code" required /><br />
	<button>Verify</button>
	<p>{form?.message ?? ""}</p>
</form>
<a href="/settings/authentication/reset">Use recovery code</a>

{#if data.user.registeredPasskey}
	<a href="/settings/authentication/passkey">Use passkeys</a>
{/if}
{#if data.user.registeredSecurityKey}
	<a href="/settings/authentication/security-key">Use security keys</a>
{/if}
