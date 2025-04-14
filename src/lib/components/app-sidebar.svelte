<script lang="ts" module>
	import ListCheck from "@lucide/svelte/icons/list-check";
	import Newspaper from "@lucide/svelte/icons/newspaper";
	import MessageSquareText from "@lucide/svelte/icons/message-square-text";
	import Layers from "@lucide/svelte/icons/layers";
	import Square from "@lucide/svelte/icons/square";
	import LifeBuoy from "@lucide/svelte/icons/life-buoy";
	import Send from "@lucide/svelte/icons/send";
	import Settings2 from "@lucide/svelte/icons/settings-2";
	import SquareTerminal from "@lucide/svelte/icons/square-terminal";
	import BadgeCheck from "@lucide/svelte/icons/badge-check";

	const data = {
		user: {
			name: "Syed",
			email: "me@syedkhairi.com",
			avatar: "/avatars/shadcn.jpg",
		},
		navMain: [
			{
				title: "Feeds",
				url: "/feeds",
				icon: Newspaper,
				isActive: true
			},
			{
				title: "Posts",
				url: "/posts",
				icon: MessageSquareText,
				items: [
					{
						title: "Published",
						url: "/posts/published",
					},
					{
						title: "Scheduled",
						url: "/posts/scheduled",
					},
				]
			},
			{
				title: "Playground",
				url: "/playground",
				icon: SquareTerminal,
			},
			{
				title: "Examples",
				url: "/library",
				icon: Layers,
			},
			{
				title: "Settings",
				url: "/settings",
				icon: Settings2,
			},
		],
		navSecondary: [
			{
				title: "Support",
				url: "#",
				icon: LifeBuoy,
			},
			{
				title: "Feedback",
				url: "#",
				icon: Send,
			},
		],
		feeds: [
			{
				name: "Design Engineering",
				url: "#",
				icon: Square,
			},
			{
				name: "Sales & Marketing",
				url: "#",
				icon: Square,
			},
			{
				name: "Travel",
				url: "#",
				icon: Square,
			},
		]
	};
</script>

<script lang="ts">
	import NavMain from "$lib/components/nav-main.svelte";
	import NavFeeds from "$lib/components/nav-feeds.svelte";
	import NavSecondary from "$lib/components/nav-secondary.svelte";
	import NavUser from "$lib/components/nav-user.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import Command from "@lucide/svelte/icons/command";
	import type { ComponentProps } from "svelte";
	import NavPremiumFeeds from "./nav-premium-feeds.svelte";

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root bind:ref variant="inset" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="##" {...props}>
							<div
								class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
							>
								<Command class="size-4" />
							</div>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-semibold">Monsters Inc</span>
								<span class="truncate text-xs">Enterprise</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={data.navMain} />
		<NavFeeds feeds={data.feeds} />
		<NavSecondary items={data.navSecondary} class="mt-auto" />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser user={data.user} />
	</Sidebar.Footer>
</Sidebar.Root>
