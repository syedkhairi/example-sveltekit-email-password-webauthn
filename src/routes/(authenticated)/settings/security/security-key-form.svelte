<script lang="ts" module>
	import { z } from "zod";

	export const securityKeySchema = z.object({
		registeredSecurityKey: z.boolean().default(false),
		securityKeyCredentialIds: z.array(z.instanceof(Uint8Array)),
	});

	export type SecurityKeySchema = typeof securityKeySchema;
</script>

<script lang="ts">
	import { type Infer, type SuperValidated, superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import { toast } from "svelte-sonner";

	let { data }: { data: SuperValidated<Infer<SecurityKeySchema>> } = $props();

	const form = superForm(data, {
		validators: zodClient(securityKeySchema),
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

<form method="POST" class="space-y-3" use:enhance action="?/update_security_key">
	<Form.Field
		{form}
		name="registeredSecurityKey"
		class="flex flex-row items-center justify-between rounded-lg border p-4"
	>
		<Form.Control>
			{#snippet children({ props })}
				<div class="space-y-0.5 mr-7">
					<Form.Label class="text-base">Security Key</Form.Label>
					<Form.Description>
						Use Security Key for two-factor authentication. This will require you to use an authentication device
						such as a USB key.
					</Form.Description>
				</div>
				<Switch {...props} bind:checked={$formData.registeredSecurityKey} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<!-- <Form.Button>Save</Form.Button> -->
</form>