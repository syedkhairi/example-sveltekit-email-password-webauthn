<script lang="ts">
    import type { PageData } from './$types';
    import SuperDebug from "sveltekit-superforms";
	import EmailForm from './email-form.svelte';
    import PasswordForm from './password-form.svelte';
	import { Separator } from "$lib/components/ui/separator/index.js";	
    import { browser } from "$app/environment";
	import TotpForm from './totp-form.svelte';
	import PasskeyForm from './passkey-form.svelte';
	import SecurityKeyForm from './security-key-form.svelte';
	import RecoveryCode from './recovery-code.svelte';

	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">Security</h3>
		<p class="text-muted-foreground text-sm">
			Set your preferred authentication methods and manage your account security.
		</p>
	</div>
	<Separator />
	<EmailForm data={data.emailForm} />
	<Separator />
	<PasswordForm data={data.passwordForm} />
	<Separator />
	<TotpForm data={data.totpForm} />
	<PasskeyForm data={data.passkeyForm} />
	<SecurityKeyForm data={data.securityKeyForm} />
	<RecoveryCode />
</div>

<!-- {#if browser}
	<SuperDebug data={data.form} />
{/if} -->