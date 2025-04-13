<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import Smartphone from "@lucide/svelte/icons/smartphone";
	import Fingerprint from "@lucide/svelte/icons/fingerprint";
	import KeySquare from "@lucide/svelte/icons/key-square";
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">Set up two-factor authentication</h3>
		<p class="text-muted-foreground text-sm">
			Two-factor authentication (2FA) adds an extra layer of security to your account.
			This is highly recommended to protect your account from unauthorised access.
		</p>
	</div>

	<Separator />

	<div class="grid grid-cols-3 gap-4">
		<Button
			variant="outline"
			href="/settings/authentication/totp/setup"
		>
			<Smartphone class="mr-1 h-4 w-4" />
			Authenticator apps
		</Button>

		<Button
			variant="outline"
			href="/settings/authentication/passkey/register"
		>
			<Fingerprint class="mr-1 h-4 w-4" />
			Passkeys
		</Button>

		<Button
			variant="outline"
			href="/settings/authentication/security-key/register"
		>
			<KeySquare class="mr-1 h-4 w-4" />
			Security keys
		</Button>
	</div>
</div>