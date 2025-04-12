<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
</script>

<div class="flex flex-row items-center justify-between rounded-lg border p-4">
    <div class="space-y-0.5 mr-7">
        <Label class="text-base">Recovery Code</Label>
        <p class="text-muted-foreground text-sm">
            View your recovery code to access your account in case you lose access to your authentication methods.
        </p>
    </div>
    <Button
        variant="outline"
        class="text-sm"
        href="/recovery-code"
    >
       View
    </Button>
</div>