<script lang="ts" module>
	import { z } from "zod";

	export const forgotPasswordFormSchema = z.object({
		email: z.string().email()
	});

	export type ForgotPasswordFormSchema = typeof forgotPasswordFormSchema;
</script>

<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
    import SuperDebug, { type Infer, type SuperValidated, superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import * as Form from "$lib/components/ui/form/index.js";
	import { browser } from "$app/environment";
    import { toast } from "svelte-sonner";

	let { data }: { data: SuperValidated<Infer<ForgotPasswordFormSchema>> } = $props();

	const form = superForm(data, {
		validators: zodClient(forgotPasswordFormSchema),
        onResult: ({ result }) => {
            if (result.type === "failure") {
                toast.error(result.data?.message ?? "An error occurred");
            }

            if (result.type === "success") {
                toast.success(result.data?.message ?? "Success");
            }
        },
	});
	const { form: formData, enhance } = form;
</script>

<Card.Root class="mx-auto max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Forgot your password?</Card.Title>
		<Card.Description>Enter your email below to reset your password</Card.Description>
	</Card.Header>
	<Card.Content>
        <form method="POST" class="grid gap-4" use:enhance>
            <Form.Field name="email" {form}>
                <Form.Control>
                    {#snippet children({ props })}
                        <Form.Label>Email address</Form.Label>
                        <Input {...props} type="email" autocomplete="email" placeholder="syed@feedr.com" bind:value={$formData.email} />
                    {/snippet}
                </Form.Control>
                <Form.FieldErrors />
            </Form.Field>
            <Form.Button class="w-full">Submit</Form.Button>
        </form>

        <!-- {#if browser}
            <SuperDebug data={$formData} />
        {/if} -->
	</Card.Content>
</Card.Root>
