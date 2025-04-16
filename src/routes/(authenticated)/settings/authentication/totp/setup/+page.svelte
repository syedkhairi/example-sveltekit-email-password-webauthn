<script lang="ts" module>
	import { z } from "zod";
	export const formSchema = z.object({
		encodedTOTPKey: z.string(),
		pin: z.string().min(6, {
			message: "Your one-time password must be at least 8 characters."
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
	import { browser, dev } from "$app/environment";
	import * as InputOTP from "$lib/components/ui/input-otp/index.js";
	import * as Form from "$lib/components/ui/form/index.js";
	import { cn } from "$lib/utils";
	import Loader from "@lucide/svelte/icons/loader";

	let { data }: { data: { form: SuperValidated<Infer<FormSchema>>, qrcode: string } } = $props(); 
	
	const form = superForm(data.form, {
		resetForm: false,
		validators: zodClient(formSchema),
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

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">Set up authenticator app</h3>
		<p class="text-muted-foreground text-sm">
			This will require you to use an authenticator app such as Apple Password, Google Authenticator, Authy, or Microsoft Authenticator.
		</p>
	</div>

	<div style="width:200px; height: 200px;">
		{@html data.qrcode}
	</div>

	<form method="POST" class="space-y-3" use:enhance>
		<input name="encodedTOTPKey" value={$formData.encodedTOTPKey} hidden required />
		<Form.Field {form} name="pin">
			<Form.Control>
				{#snippet children({ props })}
				<InputOTP.Root maxlength={6} {...props} bind:value={$formData.pin}>
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
		<Form.Button
			disabled={($formData.pin.length < 6) || $submitting}    
		>
			Submit
			<Loader class={cn("ml-0.5 size-3 animate-spin" , {
				"hidden": !$submitting,
			})}/>
		</Form.Button>
	</form>

	{#if browser}
		<SuperDebug data={$formData} display={dev} />
	{/if}
</div>