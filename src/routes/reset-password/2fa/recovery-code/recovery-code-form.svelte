<script lang="ts" module>
	import { z } from "zod";
	export const formSchema = z.object({
		code: z.string().min(6, {
			message: "Your recovery code must be at least 8 characters."
		})
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
	import { browser } from "$app/environment";
	import * as InputOTP from "$lib/components/ui/input-otp/index.js";
	import * as Form from "$lib/components/ui/form/index.js";
    import * as Card from "$lib/components/ui/card/index.js";

	let { data }: { data: { form: SuperValidated<Infer<FormSchema>>, qrcode: string } } = $props(); 
	
	const form = superForm(data.form, {
		validators: zodClient(formSchema),
		onUpdated: (event) => {
			console.log(event.form.message)
		}
	});

	const { form: formData, enhance } = form;
</script>

<Card.Root class="mx-auto max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Authenticate with passkeys</Card.Title>
		<Card.Description>As a two-factor security measure, please authenticate with your passkeys you have used previously.</Card.Description>
	</Card.Header>
	<Card.Content>
        <form method="POST" class="w-2/3 space-y-6" use:enhance>
            <Form.Field {form} name="code">
                <Form.Control>
                    {#snippet children({ props })}
                    <InputOTP.Root maxlength={6} {...props} bind:value={$formData.code}>
                        {#snippet children({ cells })}
                        <InputOTP.Group>
                            {#each cells as cell (cell)}
                            <InputOTP.Slot {cell} />
                            {/each}
                        </InputOTP.Group>
                        {/snippet}
                    </InputOTP.Root>
                    {/snippet}
                </Form.Control>
                <Form.Description>
                    Please enter the one-time password from your authenticator app.
                </Form.Description>
                <Form.FieldErrors />
            </Form.Field>
            <Form.Button>Submit</Form.Button>
        </form>

        {#if browser}
            <SuperDebug data={$formData} />
        {/if}
    </Card.Content>
</Card.Root>