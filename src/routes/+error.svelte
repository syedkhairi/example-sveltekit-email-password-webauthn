<script lang="ts">
    import { page } from "$app/state";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
    import SuperDebug from "sveltekit-superforms";
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
    <Card.Root class="mx-auto min-w-sm max-w-sm">
        <Card.Header>
            <Card.Title class="text-2xl">Uh oh!</Card.Title>
            <Card.Description>You encountered an error with details below.</Card.Description>
        </Card.Header>
        <Card.Content>
            <div class="grid gap-4">
                <SuperDebug
                    data={{
                        status: page.status,
                        message: page.error?.message
                    }}
                />
                <Button class="w-full" href="/">Return to home</Button>
            </div>
        </Card.Content>
    </Card.Root>
</div>