<script lang="ts" module>
	import { z } from "zod";

	export const emailFormSchema = z.object({
		currentEmailAddress: z
			.string({
				required_error: "Required.",
			})
			.min(2, "Email must be at least 2 characters.")
			.max(30, "Email must not be longer than 30 characters")
			.email("Invalid email address format."),
		newEmailAddress: z
			.string({
				required_error: "Required.",
			})
			.min(2, "Email must be at least 2 characters.")
			.max(30, "Email must not be longer than 30 characters")
			.email("Invalid email address format."),
	});

	export type EmailFormSchema = typeof emailFormSchema;
</script>

<script lang="ts">
	import { type Infer, type SuperValidated, superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { browser } from "$app/environment";

	let { data }: { data: SuperValidated<Infer<EmailFormSchema>> } = $props();

	const form = superForm(data, {
		resetForm: false,
		validators: zodClient(emailFormSchema),
	});
	const { form: formData, enhance, validate } = form;
</script>

<form method="POST" class="space-y-3" use:enhance action="?/update_email">
	<Form.Field name="currentEmailAddress" {form}>
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Current email address</Form.Label>
				<Input readonly {...props} bind:value={$formData.currentEmailAddress} type="email" />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
    <Form.Field name="newEmailAddress" {form}>
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>New email address</Form.Label>
				<Input {...props} bind:value={$formData.newEmailAddress} placeholder="Enter your new email address" type="email" />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button>Save</Form.Button>
</form>