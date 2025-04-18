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
	import { browser } from "$app/environment";
	import Loader from "@lucide/svelte/icons/loader";
	import { cn } from "$lib/utils";
	import { toast } from "svelte-sonner";

	let { data }: { data: SuperValidated<Infer<PasswordFormSchema>> } = $props();

	const form = superForm(data, {
		resetForm: true,
		validators: zodClient(passwordFormSchema),
		onResult: ({ result }) => {
			if (result.type === "failure") {
				toast.error(result.data?.message ?? "An error occurred");
			}

			if (result.type === "success") {
				toast.success(result.data?.message ?? "Success");
			}
		},
	});
	const { form: formData, enhance, submitting } = form;
</script>

<form method="POST" class="space-y-3" use:enhance action="?/update_password">
	<Form.Field name="currentPassword" {form}>
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Current password</Form.Label>
				<Input {...props} type="password" bind:value={$formData.currentPassword} required autocomplete="current-password" placeholder="Enter your current password" />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field name="newPassword" {form}>
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>New password</Form.Label>
				<Input {...props} type="password" bind:value={$formData.newPassword} required autocomplete="new-password" placeholder="Enter your new password" />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button
		disabled={!$formData.currentPassword || !$formData.newPassword || $submitting}  
	>
		Save
		<Loader class={cn("ml-0.5 size-3 animate-spin" , {
			"hidden": !$submitting,
		})}/>
	</Form.Button>
</form>