<script lang="ts" module>
	import { z } from "zod";

	export const totpFormSchema = z.object({
		registeredTotp: z.boolean().default(false),
	});

	export type TotpFormSchema = typeof totpFormSchema;
</script>

<script lang="ts">
	import SuperDebug, { type Infer, type SuperValidated, superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import { browser } from "$app/environment";
	import { toast } from "svelte-sonner";

	let { data }: { data: SuperValidated<Infer<TotpFormSchema>> } = $props();

	const form = superForm(data, {
		resetForm: false,
		validators: zodClient(totpFormSchema),
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

<form method="POST" class="space-y-3" use:enhance action="?/update_totp">
	<Form.Field
		{form}
		name="registeredTotp"
		class="flex flex-row items-center justify-between rounded-lg border p-4"
	>
		<Form.Control>
			{#snippet children({ props })}
				<div class="space-y-0.5 mr-7">
					<Form.Label class="text-base">Authenticatior App</Form.Label>
					<Form.Description>
						Use Time-based One-Time Password (TOTP) for two-factor authentication. This will require you to use an authenticator app
						to generate a time-based one-time password.
					</Form.Description>
				</div>
				<Switch {...props} bind:checked={$formData.registeredTotp} /> 
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
</form>

<!-- {#if browser}
	<SuperDebug data={$formData} display={dev} />
{/if} -->