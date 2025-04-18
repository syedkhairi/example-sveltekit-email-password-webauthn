<script lang="ts" module>
	import { z } from "zod";

	export const profileFormSchema = z.object({
        name: z
            .string({ required_error: "Required." })
            .min(2, "Name must be at least 2 characters."),
		username: z
			.string({ required_error: "Required." })
			.min(2, "Username must be at least 3 characters."),
	});

	export type ProfileFormSchema = typeof profileFormSchema;
</script>

<script lang="ts">
	import SuperDebug, { type Infer, type SuperValidated, superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { browser, dev } from "$app/environment";
	import { cn } from "$lib/utils";
	import Loader from "@lucide/svelte/icons/loader";

	let { data }: { data: SuperValidated<Infer<ProfileFormSchema>> } = $props();

	const form = superForm(data, {
		resetForm: false,
		validators: zodClient(profileFormSchema),
	});
	const { form: formData, enhance, submitting, tainted } = form;
</script>

<form method="POST" class="space-y-3" use:enhance action="?/update_name_username">
	<Form.Field name="name" {form}>
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Name</Form.Label>
				<Input {...props} bind:value={$formData.name} placeholder="Enter your preferred name" required autocomplete="name" />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field name="username" {form}>
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Username</Form.Label>
				<Input {...props} bind:value={$formData.username} placeholder="Enter your username" required autocomplete="username" />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	
	<Form.Button
		disabled={$submitting || !$tainted}   
	>
		Save
		<Loader class={cn("ml-0.5 size-3 animate-spin" , {
			"hidden": !$submitting,
		})}/>
	</Form.Button>
</form>

{#if browser}
    <SuperDebug data={$formData} display={dev} />
{/if}