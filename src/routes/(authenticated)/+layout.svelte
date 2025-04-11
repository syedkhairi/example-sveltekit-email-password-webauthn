<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { LayoutData } from './$types';
	import SidebarPage from '$lib/components/sidebar-page.svelte';
	import AppSidebar from "$lib/components/app-sidebar.svelte";
	import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { page } from '$app/state';

    let { data, children }: { data: LayoutData, children: Snippet } = $props();

    let urlParts = $derived.by(() => {
        return page.url.pathname.split('/')
            .filter((part) => part !== '')
    })

</script>

<Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Inset>
		<header class="flex h-16 shrink-0 items-center gap-2">
			<div class="flex items-center gap-2 px-4">
				<Sidebar.Trigger class="-ml-1" />
				<Separator orientation="vertical" class="mr-2 h-4" />
				<Breadcrumb.Root>
					<Breadcrumb.List>
                        {#each urlParts as part, index}
                            <Breadcrumb.Item>
                                {#if index === urlParts.length - 1}
                                    <Breadcrumb.Page class="first-letter:uppercase">{part}</Breadcrumb.Page>
                                {:else}
                                    <Breadcrumb.Link class="first-letter:uppercase" href={`/${urlParts.slice(0, index + 1).join('/')}`}>
                                        {part}
                                    </Breadcrumb.Link>
                                {/if}
                            </Breadcrumb.Item>
                            {#if index < urlParts.length - 1}
                                <Breadcrumb.Separator class="hidden md:block" />
                            {/if}
                        {/each}
					</Breadcrumb.List>
				</Breadcrumb.Root>
			</div>
		</header>
		<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
			<div class="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min">
                {@render children()}
            </div>
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>

