<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { LayoutData } from './$types';
	import SidebarNav from "./(components)/sidebar-nav.svelte";
    import { Separator } from "$lib/components/ui/separator/index.js";

    let { data, children }: { data: LayoutData, children: Snippet } = $props();

	const sidebarNavItems = [
		{
			title: "Profile",
			href: "/settings/profile",
		},
		{
			title: "Security",
			href: "/settings/security",
		},
		{
			title: "Connections",
			href: "/settings/connections",
		},
		{
			title: "Billing",
			href: "/settings/billing",
		},
	];
</script>

<div class="block space-y-6 px-9 py-5 pb-16">
	<div class="space-y-0.5">
		<h2 class="text-2xl font-bold tracking-tight">Settings</h2>
		<p class="text-muted-foreground">
			Manage your account settings and set e-mail preferences.
		</p>
	</div>
	<Separator class="my-6" />
	<div class="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
		<aside class="-mx-4 lg:w-1/5">
			<SidebarNav items={sidebarNavItems} />
		</aside>
		<div class="flex-1 lg:max-w-2xl">
            {@render children()}
		</div>
	</div>
</div>
