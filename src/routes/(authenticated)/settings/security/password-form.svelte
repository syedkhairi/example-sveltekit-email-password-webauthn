<script lang="ts" module>
	import { z } from "zod";

	export const passwordFormSchema = z.object({
		currentPassword: z
			.string({ required_error: "Required." })
			.min(8, "Password must be at least 8 characters.")
			.max(100, "Password must not be longer than 100 characters."),
		newPassword: z
			.string({ required_error: "Required." })
			.min(8, "Password must be at least 8 characters.")
			.max(100, "Password must not be longer than 100 characters.")
	});

	export type PasswordFormSchema = typeof passwordFormSchema;
</script>

<script lang="ts">
	import SuperDebug, { type Infer, type SuperValidated, superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input/index.js";

	let { data }: { data: SuperValidated<Infer<PasswordFormSchema>> } = $props();

	const form = superForm(data, {
		validators: zodClient(passwordFormSchema),
	});
	const { form: formData, enhance, validate } = form;
</script>

<form method="POST" class="space-y-3" use:enhance action="?/update_password">
	<Form.Field name="currentPassword" {form}>
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Current password</Form.Label>
				<Input {...props} type="password" bind:value={$formData.currentPassword} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field name="newPassword" {form}>
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>New password</Form.Label>
				<Input {...props} type="password" bind:value={$formData.newPassword} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button>Save</Form.Button>
</form>