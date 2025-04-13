<script lang="ts" module>
	import { z } from "zod";

	export const registerFormSchema = z.object({
		name: z
			.string()
			.min(2, "Name must be at least 4 characters long"),
        username: z
            .string()
            .min(4, "Username must be at least 4 characters long")
            .max(31, "Username must not be longer than 31 characters"),
		email: z
            .string()
            .email(),
		password: z
            .string()
            .min(8, "Password must be at least 8 characters long"),
	});

	export type RegisterFormSchema = typeof registerFormSchema;
</script>

<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { zodClient } from "sveltekit-superforms/adapters";
	import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
	import { toast } from "svelte-sonner";

	let { data }: { data: SuperValidated<Infer<RegisterFormSchema>> } = $props();

	const form = superForm(data, {
		validators: zodClient(registerFormSchema),
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
		<Card.Title class="text-2xl">Register</Card.Title>
		<Card.Description>Enter your details below to create your account</Card.Description>
	</Card.Header>
	<Card.Content>
		<form method="POST" class="grid gap-2" use:enhance>
			<Form.Field name="name" {form}>
                <Form.Control>
                    {#snippet children({ props })}
                        <Form.Label>Name</Form.Label>
                        <Input {...props} type="text" required placeholder="Enter your name" bind:value={$formData.name} autocomplete="name" minlength={2} />
                    {/snippet}
                </Form.Control>
                <Form.FieldErrors />
            </Form.Field>

            <Form.Field name="username" {form}>
                <Form.Control>
                    {#snippet children({ props })}
                        <Form.Label>Username</Form.Label>
                        <Input {...props} type="text" required placeholder="Enter your username" bind:value={$formData.username} autocomplete="username" minlength={4} maxlength={31} />
                    {/snippet}
                </Form.Control>
                <Form.FieldErrors />
            </Form.Field>

            <Form.Field name="email" {form}>
                <Form.Control>
                    {#snippet children({ props })}
                        <Form.Label>Email address</Form.Label>
                        <Input {...props} type="email" required placeholder="Enter your email" bind:value={$formData.email} autocomplete="email" />
                    {/snippet}
                </Form.Control>
                <Form.FieldErrors />
            </Form.Field>

			<Form.Field name="password" {form}>
                <Form.Control>
                    {#snippet children({ props })}
                        <Form.Label>Password</Form.Label>
                        <Input {...props} type="password" required placeholder="Enter your password" bind:value={$formData.password} autocomplete="new-password" />
                    {/snippet}
                </Form.Control>
                <Form.FieldErrors />
            </Form.Field>

            <Form.Button class="w-full">Register</Form.Button>
        </form>

		<div class="mt-4 text-center text-sm">
			Have an account?
			<a href="/login" class="underline"> Sign in </a>
		</div>
	</Card.Content>
</Card.Root>
