<script lang="ts" module>
	import { z } from "zod";

	export const connectionsFormSchema = z.object({
        accounts: z.array(
            z.object({
                handle: z.string().min(2, "Handle must be at least 2 characters."),
                did: z.string().min(2, "DID must be at least 2 characters."),
                app_password: z.string().min(1, "App password must not be empty."),
            })
        )
    })

	export type ConnectionsFormSchema = typeof connectionsFormSchema;
</script>

<script lang="ts">
	import SuperDebug, { type Infer, type SuperValidated, superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { browser, dev } from "$app/environment";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Avatar from "$lib/components/ui/avatar/index.js";
    import Trash from "@lucide/svelte/icons/trash";
    import Loader from "@lucide/svelte/icons/loader";
	import SquareArrowOutUpRight from "@lucide/svelte/icons/square-arrow-out-up-right";
	import { toast } from "svelte-sonner";
	import { cn } from "$lib/utils";

	let { data }: { data: SuperValidated<Infer<ConnectionsFormSchema>> } = $props();

	const form = superForm(data, {
        dataType: 'json',
		resetForm: false,
		validators: zodClient(connectionsFormSchema),
        onSubmit: async ({ cancel }) => {
            for (let i = 0; i < $formData.accounts.length; i++) {
                const account = $formData.accounts[i];
                if (account.handle) {
                    account.handle = account.handle.replace(/@/g, "");
                    
                    // Make a fetch request to /api/get-did
                    const didResponse = await fetch("/api/get-did", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            handle: account.handle,
                        }),
                    });

                    if (didResponse.ok) {
                        const { did } = await didResponse.json();
                        $formData.accounts[i].did = did;
                    } else {
                        toast.error(`User not found for ${account.handle}`);
                        return cancel();
                    }
                }
            }
        },
        onResult: ({ result }) => {
            if (result.type === "success") {
                toast.success("Successfully saved your connections.");
            } else if (result.type === "failure") {
                toast.error(result.data?.message ?? "An error occurred");
            }
        },
	});

	const { form: formData, enhance, submitting, isTainted } = form;

    function removeAccountByIndex(index: number) {
		$formData.accounts = $formData.accounts.filter((_, i) => i !== index);
	}
 
	function addAccount() {
		$formData.accounts = [...$formData.accounts, {
            handle: "",
            did: "",
            app_password: "",
        }];
	}

    const avatarLetter = () => {
        const firstAccount = $formData.accounts[0];
        if (firstAccount && firstAccount.handle) {
            return firstAccount.handle.charAt(0).toUpperCase();
        }
        return "B";
    }
</script>

<form method="POST" use:enhance>
    <Form.Fieldset {form} name="accounts" class="space-y-4">
        {#each $formData.accounts as _, i}
            <div class="flex flex-row items-start space-x-5 rounded-lg border p-4">
                <Avatar.Root class="size-10 rounded-lg">
                    <Avatar.Image src="" alt={$formData.accounts[i].handle} />
                    <Avatar.Fallback class="rounded-lg">{avatarLetter()}</Avatar.Fallback>
                </Avatar.Root>

                <div class="grid grid-cols-2 gap-3">
                    <input type="hidden" name="accounts[{i}].did" bind:value={$formData.accounts[i].did} />

                    <Form.ElementField {form} name="accounts[{i}].handle">
                        <Form.Control>
                            {#snippet children({ props })}
                                <Form.Label>Account {i + 1}</Form.Label>
                                <Input type="text" disabled={$submitting} {...props} bind:value={$formData.accounts[i].handle} placeholder="E.g: @blackmirror.bsky.social" />
                            {/snippet}
                        </Form.Control>
                        <Form.Description>
                            Your Bluesky handle or username.
                        </Form.Description>
                        <Form.FieldErrors />
                    </Form.ElementField>

                    <Form.ElementField {form} name="accounts[{i}].app_password">
                        <Form.Control>
                            {#snippet children({ props })}
                                <Form.Label>App Password for Account {i + 1}</Form.Label>
                                <Input type="password" disabled={$submitting} {...props} bind:value={$formData.accounts[i].app_password} placeholder="Enter your app password" />
                            {/snippet}
                        </Form.Control>
                        <Form.Description>
                            <a href="https://bsky.app/settings/app-passwords" target="_blank" class="hover:underline hover:underline-offset-2">Click here to generate an app specific password <SquareArrowOutUpRight class="ml-1 inline align-middle w-3" /></a>
                        </Form.Description>
                        <Form.FieldErrors />
                    </Form.ElementField>
                </div>

                <Button
                    variant="destructive"
                    size="icon"
                    class="self-start shrink-0"
                    disabled={$submitting}
                    onclick={() => removeAccountByIndex(i)}
                >
                    <Trash class="size-4" />
                </Button>
            </div>
        {/each}
        <Form.FieldErrors />
    </Form.Fieldset>

    <div class="space-x-3">
        <Button 
            variant="secondary" 
            onclick={addAccount}
            disabled={$submitting}
        >
            Add {$formData.accounts.length === 0 ? "a" : "another"} Bluesky account
        </Button>

        {#if $formData.accounts.length > 0}
            <Form.Button
                disabled={($formData.accounts.length === 0) || $submitting}    
            >
                Validate and save
                <Loader class={cn("ml-0.5 size-3 animate-spin" , {
                    "hidden": !$submitting,
                })}/>
            </Form.Button>
        {/if}
    </div>
</form>

{#if browser}
    <SuperDebug data={$formData} display={dev} />
{/if}