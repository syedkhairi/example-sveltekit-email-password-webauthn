<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { enhance } from "$app/forms";

    let { recoveryCode }: { recoveryCode: string | null } = $props();
</script>

<div class="flex flex-row items-center justify-between rounded-lg border p-4">
    <div class="space-y-0.5 mr-7">
        <Label class="text-base">Recovery Code</Label>
        <p class="text-muted-foreground text-sm">
            View your recovery code to access your account in case you lose access to your authentication methods.
        </p>
    </div>

    {#if recoveryCode !== null}
        <Button
            variant="outline"
            class="text-sm"
            href="/recovery-code"
        >
        View
        </Button>
    {:else}
        <form method="post" use:enhance action="?/regenerate_recovery_code">
            <Button
                variant="outline"
                class="text-sm"
                href="/recovery-code"
            >
                Generate new code
            </Button>
        </form>
    {/if}
</div>