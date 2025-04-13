<script lang="ts" module>
	import { z } from "zod";
	export const formSchema = z.object({
		code: z.string().min(8, {
			message: "Your verification code must be at least 8 characters."
		})
	});
	export type FormSchema = typeof formSchema;
</script>

<script lang="ts">
	import * as InputOTP from "$lib/components/ui/input-otp/index.js";
	import SuperDebug, {
		type Infer,
		type SuperValidated,
		superForm
	} from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import { toast } from "svelte-sonner";
	import { browser } from "$app/environment";
	import * as Form from "$lib/components/ui/form/index.js";

    let { data }: { data: SuperValidated<Infer<FormSchema>> } = $props();

	const form = superForm(data, {
		validators: zodClient(formSchema),
		onUpdated: ({ form: f }) => {
			if (f.valid) {
				toast.success(`You submitted ${JSON.stringify(f.data, null, 2)}`);
			} else {
				toast.error("Please fix the errors in the form.");
			}
		}
	});
	
	const { form: formData, enhance } = form;
</script>

<form method="post" use:enhance action="?/verify">
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
            Please enter the 8-digit code we sent to your email address.
        </Form.Description>
        <Form.FieldErrors />
    </Form.Field>
    <Form.Button>Submit</Form.Button>
</form>

{#if browser}
    <SuperDebug
        data={$formData}
    />
{/if}
