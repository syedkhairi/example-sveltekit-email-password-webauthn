<script lang="ts" module>
	import { z } from "zod";
	export const formSchema = z.object({
		password: z.string()
            .min(8, { message: "Your password must be at least 8 characters." })
            .max(100, { message: "Your password must not be longer than 100 characters." }),
	});
	export type FormSchema = typeof formSchema;
</script>

<script lang="ts">
	import SuperDebug, {
		type Infer,
		type SuperValidated,
		superForm
	} from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import { toast } from "svelte-sonner";
	import { browser, dev } from "$app/environment";
	import * as Form from "$lib/components/ui/form/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Input } from "$lib/components/ui/input/index.js";

	let { data }: { data: SuperValidated<Infer<FormSchema>> } = $props();
	
	const form = superForm(data, {
		validators: zodClient(formSchema),
        onResult: ({ result }) => {
            if (result.type === "success") {
                toast.success(`You submitted ${JSON.stringify(result.data, null, 2)}`);
            } else if (result.type === "failure") {
                toast.error(result.data?.measure ?? "An error occurred");
            }
        },
		onUpdated: (event) => {
			console.log(event.form.message)
		}
	});

	const { form: formData, enhance } = form;
</script>

<Card.Root class="mx-auto max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Reset password</Card.Title>
		<Card.Description>Please enter your new password below.</Card.Description>
	</Card.Header>
	<Card.Content>
        <form method="POST" class="space-y-3" use:enhance>
            <Form.Field name="password" {form}>
                <Form.Control>
                    {#snippet children({ props })}
                        <Form.Label>New password</Form.Label>
                        <Input {...props} bind:value={$formData.password} required type="password" autocomplete="new-password" />
                    {/snippet}
                </Form.Control>
                <Form.FieldErrors />
            </Form.Field>
            <Form.Button>Submit</Form.Button>
        </form>

        {#if browser}
            <SuperDebug data={$formData} display={dev} />
        {/if}
    </Card.Content>
</Card.Root>