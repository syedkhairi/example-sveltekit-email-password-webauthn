<script lang="ts" module>
	import { z } from "zod";

	export const passkeyFormSchema = z.object({
		registeredPasskey: z.boolean().default(false),
		passkeyCredentialId: z.union([z.string(), z.instanceof(Uint8Array<ArrayBufferLike>)]).nullable(),
	});

	export type PasskeyFormSchema = typeof passkeyFormSchema; // Updated type name
</script>

<script lang="ts">
	import SuperDebug, { type Infer, type SuperValidated, superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import { toast } from "svelte-sonner";
	import { browser } from "$app/environment";

	let { data }: { data: SuperValidated<Infer<PasskeyFormSchema>> } = $props();

	const form = superForm(data, {
		dataType: 'json',
		applyAction: true,
		invalidateAll: true,
		validators: zodClient(passkeyFormSchema),
		onResult: ({ result }) => {
			if (result.type === "failure") {
				toast.error(result.data?.message ?? "An error occurred");
			}

			if (result.type === "success") {
				toast.success(result.data?.message ?? "Success");
			}
		},
		onChange: () => {
			submit();
		},
	});
	const { form: formData, enhance, submit } = form;
</script>

<form method="POST" class="space-y-3" use:enhance action="?/update_passkey">
	<input type="hidden" name="passkeyCredentialIds" value={$formData.passkeyCredentialId} />
	<Form.Field
		{form}
		name="registeredPasskey"
		class="flex flex-row items-center justify-between rounded-lg border p-4"
	>
		<Form.Control>
			{#snippet children({ props })}
				<div class="space-y-0.5 mr-7">
					<Form.Label class="text-base">Passkey</Form.Label>
					<Form.Description>
						Use Passkey to validate your identity. This will require you to use a device with biometric authentication
						such as a fingerprint (Touch ID) or face scan (Face ID).
					</Form.Description>
				</div>
				<Switch {...props} bind:checked={$formData.registeredPasskey} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
</form>
<!-- 
{#if browser}
	<SuperDebug data={$formData} />
{/if} -->